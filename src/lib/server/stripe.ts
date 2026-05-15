import { EventEmitter } from 'node:events'
import Stripe from 'stripe'
import { env } from '$env/dynamic/private'
import type { Prisma } from '@prisma/client'
import type { User } from 'lucia'
import { error } from '@sveltejs/kit'

import { prisma, sendEmailComponent, ensureLicenceMembers, createSSE } from '$lib/server'
import { EmailCheckoutValidation } from '$lib/email'
import EmailCheckoutDonation from '$lib/email/EmailCheckoutDonation.svelte'

export const stripe = new Stripe(env.PRIVATE_STRIPE_KEY)

const bus = new EventEmitter()

type CheckoutOptions = {
	getLineItems: (user: User, url: URL) => Stripe.Checkout.SessionCreateParams.LineItem[]
	returnPath: string
	onSuccess: (checkout: Stripe.Checkout.Session, items: Stripe.LineItem[]) => Promise<void>
	hookSecretKey: string
}

export function useCheckout(options: CheckoutOptions) {
	return {
		async create(user: User, url: URL) {
			const line_items = options.getLineItems(user, url)
			if (!line_items.length) throw Error('Items is required')
			const { client_secret } = await stripe.checkout.sessions.create({
				mode: 'payment',
				ui_mode: 'embedded',
				customer: await getStripCustomerId(user),
				line_items,
				return_url: `${url.origin}${options.returnPath}?checkoutId={CHECKOUT_SESSION_ID}`,
			})
			if (!client_secret) throw Error('Create checkout failed')
			return { clientSecret: client_secret }
		},
		async handleHook(request: Request) {
			const signature = request.headers.get('stripe-signature')

			if (!signature) error(400)
			try {
				const payload = await request.text()
				const event = await stripe.webhooks.constructEventAsync(
					payload,
					signature,
					options.hookSecretKey
				)
				if (event.type === 'checkout.session.completed') {
					const newCheckout = event.data.object
					const { data: items } = await stripe.checkout.sessions.listLineItems(newCheckout.id)
					await options.onSuccess(newCheckout, items)
					bus.emit(newCheckout.id)
				}
				return new Response('success', { status: 200 })
			} catch (err) {
				console.error(err)
				error(400)
			}
		},
		async subscribe(checkoutId: string) {
			const { readable, subscribe } = createSSE()
			subscribe(bus, checkoutId)
			return new Response(readable, {
				headers: {
					'cache-control': 'no-cache',
					'content-type': 'text/event-stream',
				},
			})
		},
	}
}

export const checkoutDonation = useCheckout({
	returnPath: '/me/donations',
	hookSecretKey: env.PRIVATE_STRIPE_WEBHOOK_KEY,
	getLineItems() {
		return [{ price: env.SUPPORT_PRICE, quantity: 1 }]
	},
	async onSuccess(checkout) {
		const userEmail = checkout.customer_details?.email || ''
		const { id: userId } = await prisma.user.findUniqueOrThrow({
			where: { email: userEmail },
			select: { id: true },
		})

		const checkoutCreated = await prisma.checkout.create({
			data: {
				id: checkout.id,
				name: 'Donation',
				userId,
				amount: checkout.amount_total ?? 0,
				currency: checkout.currency || 'CHF',
				isDonation: true,
			},
			include: { user: true },
		})
		await Promise.all([
			sendEmailComponent(EmailCheckoutDonation, {
				to: checkoutCreated.user.email,
				subject: 'Merci pour ta donation',
				props: {
					checkout: checkoutCreated,
				},
			}),
			sendEmailComponent(EmailCheckoutDonation, {
				to: env.ROOT_USER,
				subject: 'Nouvelle donation',
				props: {
					dest: 'root',
					checkout: checkoutCreated,
				},
			}),
		])
	},
})

/** @deprecated */
export const checkoutLicence = useCheckout({
	returnPath: '/me/licences',
	hookSecretKey: env.PRIVATE_STRIPE_WEBHOOK_KEY,
	getLineItems(user, url) {
		const licenceEventQuantity = url.searchParams.get('licence_event') || 1
		const licenceMemberQuantity = url.searchParams.get('licence_member') || 100
		const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = []
		if (+licenceEventQuantity)
			lineItems.push({
				price: env.LICENCE_EVENT_PRICE,
				quantity: +licenceEventQuantity,
				adjustable_quantity: { enabled: true, minimum: 0, maximum: 100 },
			})

		if (+licenceMemberQuantity)
			lineItems.push({
				price: env.LICENCE_MEMBER_PRICE,
				quantity: +licenceMemberQuantity,
				adjustable_quantity: { enabled: true, minimum: 0, maximum: 10_000 },
			})
		return lineItems
	},
	async onSuccess(checkout, items) {
		const userEmail = checkout.customer_details?.email || ''
		const { id: userId } = await prisma.user.findUniqueOrThrow({
			where: { email: userEmail },
			select: { id: true },
		})

		const licenceEvent = items.find((item) => item.price?.id === env.LICENCE_EVENT_PRICE)
		const licenceMember = items.find((item) => item.price?.id === env.LICENCE_MEMBER_PRICE)
		const licences: Prisma.LicenceCreateManyCheckoutInput[] = []
		if (licenceEvent)
			licences.push(...Array(licenceEvent.quantity ?? 0).fill({ type: 'event', ownerId: userId }))

		if (licenceMember)
			licences.push(...Array(licenceMember.quantity ?? 0).fill({ type: 'member', ownerId: userId }))

		console.log({ licences })

		const checkoutCreated = await prisma.checkout.create({
			data: {
				id: checkout.id,
				name: 'Achat',
				userId,
				amount: checkout.amount_total ?? 0,
				currency: checkout.currency || 'CHF',
				licences: { createMany: { data: licences } },
			},
			include: { user: true, licences: true },
		})

		await Promise.all([
			sendEmailComponent(EmailCheckoutValidation, {
				to: checkoutCreated.user.email,
				subject: 'Merci pour ton achat',
				props: {
					checkout: checkoutCreated,
				},
			}),
			sendEmailComponent(EmailCheckoutValidation, {
				to: env.ROOT_USER,
				subject: 'Nouvel achat de licence',
				props: {
					dest: 'root',
					checkout: checkoutCreated,
				},
			}),
			updateEventMissingLicences(userId),
		])
	},
})

async function getStripCustomerId(user: User): Promise<string> {
	const { data } = await stripe.customers.list({ email: user.email })
	if (data.length) return data[0].id

	const newCustomer = await stripe.customers.create({
		name: `${user.firstName} ${user.lastName}`,
		email: user.email,
		phone: user.phone,
	})
	return newCustomer.id
}

async function updateEventMissingLicences(ownerId: string) {
	const events = await prisma.event.findMany({
		where: { ownerId, missingLicencesMember: { gt: 0 } },
		select: { id: true },
	})
	if (!events.length) return

	for (const event of events) {
		await ensureLicenceMembers(event.id)
	}
}
