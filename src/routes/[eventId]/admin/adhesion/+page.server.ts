import { redirect } from '@sveltejs/kit'

export const load = ({ params: { eventId } }) =>
	redirect(301, `/${eventId}/admin/settings#membership`)
