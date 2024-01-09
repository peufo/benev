import { error } from '@sveltejs/kit'
import { parseFormData, permission, prisma, redirectToRegister, tryOrFail } from '$lib/server'
import { z, type ZodObj } from '$lib/validation'

export const load = async ({ url, parent, params: { eventId } }) => {
	const { member } = await parent()
	if (!member || !member.isValidedByUser) throw redirectToRegister(eventId, url)

	const memberId = member.id
	return {
		member,
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
	update_member_profile: async ({ locals, request, params: { eventId } }) => {
		const member = await permission.member(eventId, locals)
		const isLeader = member.roles.includes('leader')

		return tryOrFail(async () => {
			const fields = await prisma.field.findMany({
				where: {
					eventId,
					...(!isLeader && { memberCanWrite: true }),
				},
			})
			const model: ZodObj<{ memberId: string } & Record<string, string | undefined>> = {
				memberId: z.string(),
			}
			fields.forEach((f) => {
				if (isLeader || !f.required || f.type === 'multiselect' || f.type === 'boolean') {
					model[f.id] = z.string().optional()
					return
				}
				model[f.id] = z.string().min(1, { message: 'Valeur manquante' })
			})
			const { data, err } = await parseFormData(request, model)
			if (err) return err

			const { memberId, ...fieldsObj } = data
			if (!memberId) throw Error('memberId is required')

			const editOwnProfile = memberId === member.id
			if (!editOwnProfile && !isLeader) throw error(401)

			const fieldsToUpdate = await prisma.field.findMany({
				where: {
					eventId,
					id: { in: Object.keys(fieldsObj) },
					...(!isLeader && { memberCanWrite: true }),
				},
			})
			const entries = Object.entries(fieldsObj).filter(([id, value]) => value !== undefined) as [
				string,
				string
			][]

			await prisma.member.update({
				where: { id: memberId },
				data: {
					profile: {
						upsert: entries.map(([id, value]) => ({
							where: { fieldId_memberId: { fieldId: id, memberId } },
							create: { value, fieldId: id },
							update: { value },
						})),
					},
				},
				include: { profile: { include: { field: true } } },
			})
		})
	},
}
