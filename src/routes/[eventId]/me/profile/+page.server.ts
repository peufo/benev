import { error } from '@sveltejs/kit'
import { getUserIdOrRedirect, isLeaderInEvent, prisma, tryOrFail } from '$lib/server'

export const load = async ({ url, locals, params: { eventId } }) => {
	const userId = await getUserIdOrRedirect(url, locals)

	return {
		user: await prisma.user.findUniqueOrThrow({
			where: { id: userId },
		}),
		member: await prisma.member.findUnique({
			where: { userId_eventId: { userId, eventId } },
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
		}),
	}
}

export const actions = {
	/** Update member profile */
	default: async ({ locals, request, params: { eventId } }) => {
		const session = await locals.auth.validate()
		if (!session) throw error(401)

		const _isLeaderInEvent = await isLeaderInEvent(eventId, locals)

		return tryOrFail(async () => {
			const formData = Object.fromEntries(await request.formData())
			const data: Record<string, string> = Object.entries(formData)
				.filter(([key]) => !key.startsWith('ignored_'))
				.reduce(
					(acc, [key, value]) => ({
						...acc,
						[key.replace(/(number_)|(boolean)_/, '')]: value,
					}),
					{}
				)

			if (data.memberId && !_isLeaderInEvent) throw error(401)
			const memberId =
				data.memberId ||
				(
					await prisma.member.findUniqueOrThrow({
						where: { userId_eventId: { eventId, userId: session.user.id } },
					})
				).id

			const fields = await prisma.field.findMany({
				where: {
					eventId,
					name: { in: Object.keys(data) },
					...(!_isLeaderInEvent && { memberCanWrite: true }),
				},
			})

			await prisma.member.update({
				where: { id: memberId },
				data: {
					profile: {
						upsert: fields.map(({ name, id }) => ({
							where: { fieldId_memberId: { fieldId: id, memberId: memberId } },
							create: { value: data[name], fieldId: id },
							update: { value: data[name] },
						})),
					},
				},
			})
		})
	},
}
