import { redirect } from '@sveltejs/kit'
import { resolve } from '$app/paths'

export const load = ({ params: { eventId } }) =>
	redirect(301, resolve('/[eventId]/admin/settings#membership', { eventId }))
