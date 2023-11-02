import { error } from '@sveltejs/kit'
import { isLeaderInEvent, prisma, redirectToAuth, tryOrFail } from '$lib/server'

export const load = async ({ url, parent, params: { eventId } }) => {
	const { user } = await parent()
	if (!user) throw redirectToAuth(url)

	const member = await prisma.member.findUniqueOrThrow({
		where: { userId_eventId: { userId: user.id, eventId } },
	})
	const memberId = member.id
	return {
		user,
		memberProfile: await prisma.member.findUniqueOrThrow({
			where: { id: memberId },
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
				subscribes: {
					include: { period: { include: { team: true } } },
				},
				leaderOf: {
					include: {
						leaders: { include: { user: true } },
						periods: { include: { subscribes: true } },
					},
				},
			},
		}),
		teamsSubscribes: await prisma.team.findMany({
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
