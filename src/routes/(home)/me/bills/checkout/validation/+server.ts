import { PRIVATE_STRIPE_WEBHOOK_KEY } from '$env/static/private'
import { stripe } from '$lib/server'
import { error } from '@sveltejs/kit'

export const POST = async ({ request }) => {
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
			// TODO: Sauvegarder la commande
			// Envoyer un recu par mail
			const checkout = event.data.object
			const checkoutId = checkout.id
			const amount = checkout.amount_total
			const currency = checkout.currency
			const userEmail = checkout.customer_email

			const { data: items } = await stripe.checkout.sessions.listLineItems(checkoutId)
			console.log(checkout)
			console.log({ checkoutId, items, amount, currency, userEmail })
		}

		return new Response('success', { status: 200 })
	} catch {
		throw error(400)
	}
}
