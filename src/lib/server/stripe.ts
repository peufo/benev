import { EventEmitter } from 'node:events'
import Stripe from 'stripe'
import { env } from '$env/dynamic/private'
import { env as publicEnv } from '$env/dynamic/public'

import type { EventTier, Prisma } from '@prisma/client'
import type { User } from 'lucia'
import { error } from '@sveltejs/kit'

import { prisma, sendEmailComponent, createSSE } from '$lib/server'
import { EmailCheckoutValidation } from '$lib/email'

export const stripe = new Stripe(env.PRIVATE_STRIPE_KEY)

const bus = new EventEmitter()

type CheckoutOptions = {
	getLineItems: (user: User, url: URL) => Stripe.Checkout.SessionCreateParams.LineItem[]
	returnPath: string
	onSuccess: (checkout: Stripe.Checkout.Session, items: Stripe.LineItem[]) => Promise<void>
	hookSecretKey: string
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

export function useCheckout(options: CheckoutOptions) {
	return {
		async create(user: User, url: URL) {
			const lineItems = options.getLineItems(user, url)
			if (!lineItems.length) throw Error('Once on item is required')
			const { client_secret } = await stripe.checkout.sessions.create({
				mode: 'payment',
				ui_mode: 'embedded',
				customer: await getStripCustomerId(user),
				line_items: lineItems,
				return_url: `${url.origin}${options.returnPath}?checkoutId={CHECKOUT_SESSION_ID}`,
				metadata: {
					eventId: url.searchParams.get('eventId') || '',
				},
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

export const checkout = useCheckout({
	returnPath: '/me/checkouts',
	hookSecretKey: env.PRIVATE_STRIPE_WEBHOOK_KEY,
	getLineItems(user, url) {
		const price = url.searchParams.get('price')
		if (!price) throw new Error(`Url param "price" is required`)
		return [{ price, quantity: 1 }]
	},
	async onSuccess(checkout, items) {
		const userEmail = checkout.customer_details?.email || ''
		const { id: userId } = await prisma.user.findUniqueOrThrow({
			where: { email: userEmail },
			select: { id: true },
		})

		const products: Prisma.ProductCreateManyCheckoutInput[] = []
		for (const item of items) {
			const priceId = item.price?.id || 'wtf'
			products.push({ name: item.description, priceId })
		}

		const checkoutCreated = await prisma.checkout.create({
			data: {
				id: checkout.id,
				name: 'Achat',
				userId,
				amount: checkout.amount_total ?? 0,
				currency: checkout.currency || 'CHF',
				products: { createMany: { data: products } },
			},
			include: { user: true, products: true },
		})

		async function autoUseProduct() {
			const eventId = checkout.metadata?.eventId
			const product = checkoutCreated.products.at(0) // Yes, we handle only the first product...
			if (eventId && product)
				return useProduct(eventId, product.id).catch((err) =>
					console.error('Somthing wrong with auto use product', err)
				)
		}

		await Promise.all([
			autoUseProduct(),
			sendEmailComponent(EmailCheckoutValidation, {
				to: checkoutCreated.user.email,
				subject: 'Merci pour ton achat',
				props: {
					checkout: checkoutCreated,
				},
			}),
			sendEmailComponent(EmailCheckoutValidation, {
				to: env.ROOT_USER,
				subject: 'Nouvel achat',
				props: {
					dest: 'root',
					checkout: checkoutCreated,
				},
			}),
		])
	},
})

// TODO, use this function for manual product use
async function useProduct(eventId: string, productId: string) {
	const [event, product] = await Promise.all([
		prisma.event.findUniqueOrThrow({ where: { id: eventId } }),
		prisma.product.findUniqueOrThrow({ where: { id: productId }, include: { checkout: true } }),
	])
	if (product.eventId) {
		throw new Error('This product is aldready actived for an event')
	}
	if (event.ownerId !== product.checkout.userId) {
		throw new Error('The event owner and product owner must be the same person')
	}
	if (event.tier === 'premium' || event.tier === 'pro') {
		throw new Error('The event is already on tier "premium" or "pro"')
	}
	if (event.tier === 'standard' && product.priceId === publicEnv.PUBLIC_PRICE_STANDARD_TO_PREMIUM) {
		return setEventTier('premium')
	}
	if (event.tier === 'basic' && product.priceId === publicEnv.PUBLIC_PRICE_PREMIUM) {
		return setEventTier('premium')
	}
	if (event.tier === 'basic' && product.priceId === publicEnv.PUBLIC_PRICE_STANDARD) {
		return setEventTier('standard')
	}
	throw new Error('This product cannot be actived')

	async function setEventTier(tier: EventTier) {
		return prisma.$transaction([
			prisma.event.update({ where: { id: event.id }, data: { tier } }),
			prisma.product.update({ where: { id: product.id }, data: { eventId: event.id } }),
		])
	}
}
