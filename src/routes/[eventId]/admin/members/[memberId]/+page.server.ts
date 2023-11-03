import { prisma, getMemberProfile, permission, parseFormData, tryOrFail } from '$lib/server'
import { z } from 'zod'

export const load = async ({ params }) => {
	const { memberId, eventId } = params

	return {
		memberProfile: await getMemberProfile({ memberId }),
		event: await prisma.event.findUniqueOrThrow({
			where: { id: eventId },
			include: {
				memberFields: {
					orderBy: { position: 'asc' },
				},
				teams: {
					where: { periods: { some: { subscribes: { some: { memberId } } } } },
					include: {
						periods: {
							where: { subscribes: { some: { memberId } } },
							include: { subscribes: { where: { memberId } } },
							orderBy: { start: 'asc' },
						},
					},
				},
			},
		}),
	}
}

export const actions = {
	set_isAdmin: async ({ request, locals, params: { eventId, memberId } }) => {
		await permission.owner(eventId, locals)

		const { err, data } = await parseFormData(request, z.object({ isAdmin: z.coerce.boolean() }))
		if (err) return err

		return tryOrFail(() =>
			prisma.member.update({
				where: { id: memberId },
				data: { isAdmin: data.isAdmin },
			})
		)
	},
}
