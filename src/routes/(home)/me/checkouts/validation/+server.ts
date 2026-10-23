import { checkout } from '#lib/server/index.js'
import { error } from '@sveltejs/kit'

export const POST = async ({ request }) => checkout.handleHook(request)

export const GET = async ({ url }) => {
	const checkoutId = url.searchParams.get('checkoutId')
	if (!checkoutId) error(400, 'Achat introuvable')
	return checkout.subscribe(checkoutId)
}
