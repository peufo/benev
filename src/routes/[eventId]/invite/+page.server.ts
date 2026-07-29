import { redirect } from '@sveltejs/kit'

export const load = async ({ params }) => {
	redirect(301, `/${params.eventId}/me`)
}
