import Stripe from 'stripe'
import { PRIVATE_STRIPE_KEY, PRIVATE_STRIPE_WEBHOOK_KEY } from '$env/static/private'

import type { User } from 'lucia'
import { error } from '@sveltejs/kit'
import { prisma } from '$lib/server'
import { Prisma } from '@prisma/client'

export const stripe = new Stripe(PRIVATE_STRIPE_KEY)

const LICENCES = {
	MEMBER: 'price_1OLraBAUcTa5BjSxh9ABcdgD',
	EVENT: 'price_1OLrP1AUcTa5BjSxq1DqKGXE',
}

export const checkout = {
	async create(user: User, origin: string) {
		const customerId = await getStripCustomerId(user)

		const { client_secret } = await stripe.checkout.sessions.create({
			mode: 'payment',
			ui_mode: 'embedded',
			customer: customerId,
			return_url: `${origin}/me/bills?checkoutSessionId={CHECKOUT_SESSION_ID}`,
			line_items: [
				{
					price: LICENCES.EVENT,
					quantity: 1,
					adjustable_quantity: { enabled: true, minimum: 0, maximum: 100 },
				},
				{
					price: LICENCES.MEMBER,
					quantity: 200,
					adjustable_quantity: { enabled: true, minimum: 0, maximum: 10_000 },
				},
			],
		})
		if (!client_secret) throw Error('Create checkout failed')
		return { clientSecret: client_secret }
	},
	async handleHook(request: Request) {
		const signature = request.headers.get('stripe-signature')

		if (!signature) throw error(400)
		try {
			const payload = await request.text()
			const event = await stripe.webhooks.constructEventAsync(
				payload,
				signature,
				PRIVATE_STRIPE_WEBHOOK_KEY
			)

			if (event.type === 'checkout.session.completed') {
				// TODO: Envoyer un recu par mail
				const checkout = event.data.object
				const checkoutId = checkout.id
				const userEmail = checkout.customer_details?.email || ''
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
					licences.push({ type: 'event', quantity: licenceEvent.quantity || 0, ownerId: user.id })
				if (licenceMember)
					licences.push({ type: 'member', quantity: licenceMember.quantity || 0, ownerId: user.id })

				await prisma.checkout.create({
					data: {
						id: checkout.id,
						userId: user.id,
						amount: checkout.amount_total || 0,
						currency: checkout.currency || 'CHF',
						licences: { createMany: { data: licences } },
					},
				})
			}

			return new Response('success', { status: 200 })
		} catch (err) {
			console.error(err)
			throw error(400)
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

export async function getCustomerCheckouts(user: User) {
	const customer = await getStripCustomerId(user)
	const { data } = await stripe.checkout.sessions.list({ customer })
	return data
}
