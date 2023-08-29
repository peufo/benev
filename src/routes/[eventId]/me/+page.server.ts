import { redirect } from '@sveltejs/kit'

export const load = async ({ locals, params }) => {
	const session = await locals.auth.validate()
	const redirectPath = `/${params.eventId}/me/subscribes`
	if (session) throw redirect(301, redirectPath)
}
