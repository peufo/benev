import Stripe from 'stripe'
import { PRIVATE_STRIPE_KEY, PRIVATE_STRIPE_WEBHOOK_KEY, ROOT_USER } from '$env/static/private'
import type { Prisma } from '@prisma/client'

import type { User } from 'lucia'
import { error } from '@sveltejs/kit'
import { prisma, sendEmailTemplate } from '$lib/server'
import { EmailCheckoutValidation } from '$lib/email'

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
			return_url: `${origin}/me/licences?checkoutSessionId={CHECKOUT_SESSION_ID}`,
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
					licences.push({
						type: 'event',
						quantity: licenceEvent.quantity ?? 0,
						ownerId: user.id,
						price: licenceEvent.amount_total,
					})
				if (licenceMember)
					licences.push({
						type: 'member',
						quantity: licenceMember.quantity ?? 0,
						ownerId: user.id,
						price: licenceMember.amount_total,
					})

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
				])
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
