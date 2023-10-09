export const load = async ({ locals, url }) => {
	const session = await locals.auth.validate()
	return {
		user: session?.user,
	}
}
