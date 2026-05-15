import { checkoutDonation } from '$lib/server'
import { error } from '@sveltejs/kit'

export const POST = async ({ request }) => checkoutDonation.handleHook(request)

export const GET = async ({ url }) => {
	const checkoutId = url.searchParams.get('checkoutId')
	if (!checkoutId) error(400, 'checkoutId param is required')
	return checkoutDonation.subscribe(checkoutId)
}
