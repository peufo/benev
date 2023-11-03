import { error } from '@sveltejs/kit'
import {
	type MemberRole,
	getMemberRole,
	permission,
	prisma,
	redirectToAuth,
	tryOrFail,
} from '$lib/server'

export const load = async ({ url, parent, params: { eventId } }) => {
	const { user } = await parent()
	if (!user) throw redirectToAuth(url)

	const isLeader = (role: MemberRole) => ['owner', 'admin', 'leader'].includes(role)

	const memberProfile = await prisma.member
		.findUniqueOrThrow({
			where: { userId_eventId: { userId: user.id, eventId } },
			include: {
				event: {
					include: { memberFields: { orderBy: { position: 'asc' } } },
				},
				profile: { include: { field: true } },
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
		})
		.then((member) => ({
			...member,
			user,
			role: getMemberRole({ ...member, user }),
		}))
		.then((member) => ({
			...member,
			profile: member.profile.filter(({ field }) => isLeader(member.role) || field.memberCanRead),
			event: {
				...member.event,
				memberFields: member.event.memberFields.filter(
					(field) => isLeader(member.role) || field.memberCanRead
				),
			},
		}))

	const memberId = memberProfile.id
	return {
		user,
		memberProfile,
		memberTeams: await prisma.team.findMany({
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
			const isLeader = !['owner', 'admin', 'leader'].includes(member.role)
			if (!editOwnProfile && isLeader) throw error(401)
			// TODO: seulement inscrit à ses secteurs ?

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
