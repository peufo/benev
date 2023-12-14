import Stripe from 'stripe'
import { PRIVATE_STRIPE_KEY } from '$env/static/private'

import type { User } from 'lucia'

export const stripe = new Stripe(PRIVATE_STRIPE_KEY)

const products = {
	licenceMember: 'price_1OLraBAUcTa5BjSxh9ABcdgD',
	licenceEvent: 'price_1OLrP1AUcTa5BjSxq1DqKGXE',
}

export async function createCheckoutSession(
	user: User,
	origin: string
): Promise<{ clientSecret: string }> {
	const customerId = await getStripCustomerId(user)

	const { client_secret } = await stripe.checkout.sessions.create({
		mode: 'payment',
		ui_mode: 'embedded',
		customer: customerId,
		return_url: `${origin}/me/bills?checkoutSessionId={CHECKOUT_SESSION_ID}`,
		line_items: [
			{
				price: products.licenceEvent,
				quantity: 1,
				adjustable_quantity: { enabled: true, minimum: 0, maximum: 100 },
			},
			{
				price: products.licenceMember,
				quantity: 200,
				adjustable_quantity: { enabled: true, minimum: 0, maximum: 10_000 },
			},
		],
	})
	if (!client_secret) throw Error('Create checkout failed')
	return { clientSecret: client_secret }
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
