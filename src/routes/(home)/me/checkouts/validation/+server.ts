import { checkout } from '$lib/server'
import { error } from '@sveltejs/kit'

export const POST = async ({ request }) => checkout.handleHook(request)

export const GET = async ({ url }) => {
	const checkoutId = url.searchParams.get('checkoutId')
	if (!checkoutId) error(400, 'checkoutId param is required')
	return checkout.subscribe(checkoutId)
}
