import { EventEmitter } from 'node:events'
import Stripe from 'stripe'
import { PRIVATE_STRIPE_KEY, PRIVATE_STRIPE_WEBHOOK_KEY, ROOT_USER } from '$app/env/private'

import type { Prisma } from '@prisma/client'
import type { User } from 'lucia'
import { error } from '@sveltejs/kit'

import { prisma, sendEmailComponent, createSSE } from '$lib/server'
import { useProduct } from '$lib/server/useProduct'
import { EmailCheckoutValidation } from '$lib/email'

/**
 * Le client est créé au premier appel, pas à l'import: `vite build` évalue ce module pour lire les
 * options des routes, sans environnement, et le constructeur de Stripe refuse une clé vide.
 */
let client: Stripe | undefined
export const useStripe = () => (client ??= new Stripe(PRIVATE_STRIPE_KEY))

const bus = new EventEmitter()

type CheckoutOptions = {
	getLineItems: (user: User, url: URL) => Stripe.Checkout.SessionCreateParams.LineItem[]
	returnPath: string
	onSuccess: (checkout: Stripe.Checkout.Session, items: Stripe.LineItem[]) => Promise<void>
	hookSecretKey: string
}

async function getStripCustomerId(user: User): Promise<string> {
	const { data } = await useStripe().customers.list({ email: user.email })
	if (data.length) return data[0].id

	const newCustomer = await useStripe().customers.create({
		name: `${user.firstName} ${user.lastName}`,
		email: user.email,
		phone: user.phone,
	})
	return newCustomer.id
}

function useCheckout(options: CheckoutOptions) {
	return {
		async create(user: User, url: URL) {
			const lineItems = options.getLineItems(user, url)
			if (!lineItems.length) throw Error('Once on item is required')
			const { client_secret } = await useStripe().checkout.sessions.create({
				mode: 'payment',
				ui_mode: 'embedded_page',
				customer: await getStripCustomerId(user),
				allow_promotion_codes: true,
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
				const event = await useStripe().webhooks.constructEventAsync(
					payload,
					signature,
					options.hookSecretKey
				)
				if (event.type === 'checkout.session.completed') {
					const newCheckout = event.data.object
					const { data: items } = await useStripe().checkout.sessions.listLineItems(newCheckout.id)
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
	hookSecretKey: PRIVATE_STRIPE_WEBHOOK_KEY,
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
			products.push({ name: item.description || 'Pas de description', priceId })
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
				to: ROOT_USER,
				subject: 'Nouvel achat',
				props: {
					dest: 'root',
					checkout: checkoutCreated,
				},
			}),
		])
	},
})
