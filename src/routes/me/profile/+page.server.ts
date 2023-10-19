import { error } from '@sveltejs/kit'
import { getUserIdOrRedirect, parseFormData, prisma, tryOrFail } from '$lib/server'
import { userShema } from '$lib/form'

export const load = async ({ url, locals }) => {
	const userId = await getUserIdOrRedirect(url, locals)

	return {
		user: await prisma.user.findUniqueOrThrow({
			where: { id: userId },
			include: {
				members: {
					include: {
						event: {
							include: {
								memberFields: {
									orderBy: { position: 'asc' },
									where: { memberCanRead: true },
								},
							},
						},
						profile: {
							where: {
								field: { memberCanRead: true },
							},
						},
					},
				},
			},
		}),
	}
}

export const actions = {
	default: async ({ locals, request }) => {
		const session = await locals.auth.validate()
		if (!session) throw error(401)

		const { err, data } = await parseFormData(request, userShema)
		if (err) return err
		return tryOrFail(() =>
			prisma.user.update({
				where: { id: session.user.userId },
				data,
			})
		)
	},
}
