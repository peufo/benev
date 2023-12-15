import { checkout } from '$lib/server'

export const POST = async ({ request }) => {
	return checkout.handleHook(request)
}
