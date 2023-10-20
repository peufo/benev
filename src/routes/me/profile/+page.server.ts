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
	update_profile: async ({ locals, request }) => {
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
	generate_avatar: async ({ locals }) => {
		const session = await locals.auth.validate()
		if (!session) throw error(401)

		return tryOrFail(async () => {
			const avatarUrl = new URL('https://api.dicebear.com/7.x/avataaars/svg')
			avatarUrl.searchParams.append('seed', String(Math.random()))
			return prisma.user.update({
				where: { id: session.user.id },
				data: { avatarPlaceholder: avatarUrl.toString() },
			})
		})
	},
	upload_avatar: async ({ request }) => {
		return tryOrFail(async () => {
			const formData = await request.formData()
			const image = formData.get('image')
			const crop = formData.get('crop')
			if (typeof crop !== 'string') throw Error('crop need to be s string')
			console.log('TODO', image)

			console.log('TODO')
		})
	},
}
