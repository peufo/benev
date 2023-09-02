import { redirect } from '@sveltejs/kit'

export const load = async ({ locals, params }) => {
	const session = await locals.auth.validate()
	if (session) throw redirect(301, `/${params.eventId}/me/subscribes`)
}
