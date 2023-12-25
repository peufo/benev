import { checkout } from '$lib/server'

export const POST = async ({ request }) => checkout.handleHook(request)
