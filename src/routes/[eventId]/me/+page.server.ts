import { error } from '@sveltejs/kit'
import { permission, prisma, redirectToAuth, tryOrFail } from '$lib/server'

export const load = async ({ url, parent }) => {
	const { user, member } = await parent()
	if (!user) throw redirectToAuth(url)

	const memberId = member?.id
	return {
		user,
		memberTeams:
			memberId &&
			(await prisma.team.findMany({
				where: { periods: { some: { subscribes: { some: { memberId } } } } },
				include: {
					periods: {
						where: { subscribes: { some: { memberId } } },
						include: {
							subscribes: {
								where: { memberId },
							},
						},
					},
				},
			})),
	}
}

export const actions = {
	/** Update member profile */
	default: async ({ locals, request, params: { eventId } }) => {
		const member = await permission.member(eventId, locals)

		return tryOrFail(async () => {
			const formData = Object.fromEntries(await request.formData())
			const { memberId, ...data }: Record<string, string> = Object.entries(formData)
				.filter(([key]) => !key.startsWith('ignored_'))
				.reduce(
					(acc, [key, value]) => ({
						...acc,
						[key.replace(/(number_)|(boolean)_/, '')]: value,
					}),
					{}
				)

			if (typeof memberId !== 'string') throw Error('memberId is required')

			const editOwnProfile = memberId === member.id
			const isLeader = member.roles.includes('leader')
			if (!editOwnProfile && !isLeader) throw error(401)
			// TODO: Les leaders ne devrait avoir ce droit que sur les membres inscrit à ses secteurs ?

			const fields = await prisma.field.findMany({
				where: {
					eventId,
					name: { in: Object.keys(data) },
					...(!isLeader && { memberCanWrite: true }),
				},
			})

			await prisma.member.update({
				where: { id: memberId },
				data: {
					profile: {
						upsert: fields.map(({ name, id }) => ({
							where: { fieldId_memberId: { fieldId: id, memberId } },
							create: { value: data[name], fieldId: id },
							update: { value: data[name] },
						})),
					},
				},
			})
		})
	},
}
