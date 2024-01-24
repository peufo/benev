import Stripe from 'stripe'
import { PRIVATE_STRIPE_KEY, PRIVATE_STRIPE_WEBHOOK_KEY, ROOT_USER } from '$env/static/private'
import type { Prisma } from '@prisma/client'

import type { User } from 'lucia'
import { error } from '@sveltejs/kit'
import { prisma, sendEmailTemplate, ensureLicenceMembers } from '$lib/server'
import { EmailCheckoutValidation } from '$lib/email'

export const stripe = new Stripe(PRIVATE_STRIPE_KEY)

const LICENCES = {
	MEMBER: 'price_1OLraBAUcTa5BjSxh9ABcdgD',
	EVENT: 'price_1OLrP1AUcTa5BjSxq1DqKGXE',
}

export const checkout = {
	async create(user: User, url: URL) {
		const customerId = await getStripCustomerId(user)

		const licenceEventQuantity = url.searchParams.get('licence_event') || 1
		const licenceMemberQuantity = url.searchParams.get('licence_member') || 200
		const return_url =
			url.origin +
			(url.searchParams.get('return_url') || '/me/licences?checkoutSessionId={CHECKOUT_SESSION_ID}')

		const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = []
		if (+licenceEventQuantity)
			line_items.push({
				price: LICENCES.EVENT,
				quantity: +licenceEventQuantity,
				adjustable_quantity: { enabled: true, minimum: 0, maximum: 100 },
			})

		if (+licenceMemberQuantity)
			line_items.push({
				price: LICENCES.MEMBER,
				quantity: +licenceMemberQuantity,
				adjustable_quantity: { enabled: true, minimum: 0, maximum: 10_000 },
			})

		if (!line_items.length) throw Error('Items is required')

		const { client_secret } = await stripe.checkout.sessions.create({
			mode: 'payment',
			ui_mode: 'embedded',
			customer: customerId,
			line_items,
			return_url,
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
				PRIVATE_STRIPE_WEBHOOK_KEY
			)

			if (event.type === 'checkout.session.completed') {
				const newCheckout = event.data.object
				const checkoutId = newCheckout.id
				const userEmail = newCheckout.customer_details?.email || ''
				const [{ data: items }, user] = await Promise.all([
					stripe.checkout.sessions.listLineItems(checkoutId),
					prisma.user.findUniqueOrThrow({
						where: { email: userEmail },
						select: { id: true },
					}),
				])

				const licenceEvent = items.find((item) => item.price?.id === LICENCES.EVENT)
				const licenceMember = items.find((item) => item.price?.id === LICENCES.MEMBER)
				const licences: Prisma.LicenceCreateManyCheckoutInput[] = []
				if (licenceEvent)
					licences.push(
						...Array(licenceEvent.quantity ?? 0).fill({ type: 'event', ownerId: user.id })
					)

				if (licenceMember)
					licences.push(
						...Array(licenceMember.quantity ?? 0).fill({ type: 'member', ownerId: user.id })
					)

				const checkoutCreated = await prisma.checkout.create({
					data: {
						id: newCheckout.id,
						name: 'Achat',
						userId: user.id,
						amount: newCheckout.amount_total ?? 0,
						currency: newCheckout.currency || 'CHF',
						licences: { createMany: { data: licences } },
					},
					include: { user: true, licences: true },
				})

				await Promise.all([
					sendEmailTemplate(EmailCheckoutValidation, {
						to: checkoutCreated.user.email,
						subject: 'Merci pour ton achat',
						props: {
							checkout: checkoutCreated,
						},
					}),
					sendEmailTemplate(EmailCheckoutValidation, {
						to: ROOT_USER,
						subject: 'Nouvel achat de licence',
						props: {
							dest: 'root',
							checkout: checkoutCreated,
						},
					}),
					updateEventMissingLicences(user.id),
				])
			}

			return new Response('success', { status: 200 })
		} catch (err) {
			console.error(err)
			error(400)
		}
	},
}

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
