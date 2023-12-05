import { error } from '@sveltejs/kit'
import { parseFormData, permission, prisma, redirectToRegister, tryOrFail } from '$lib/server'
import { ZodObj, z } from '$lib/validation'

export const load = async ({ url, parent, params: { eventId } }) => {
	const { user, member } = await parent()
	if (!user || !member || !member.isValidedByUser) throw redirectToRegister(eventId, url)

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
					model[f.name] = z.string().optional()
					return
				}
				model[f.name] = z.string().min(1)
				console.log(f.name)
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
					name: { in: Object.keys(fieldsObj) },
					...(!isLeader && { memberCanWrite: true }),
				},
			})

			await prisma.member.update({
				where: { id: memberId },
				data: {
					profile: {
						upsert: fieldsToUpdate
							.map(({ name, id }) => {
								const value = fieldsObj[name] as string
								return { value, id }
							})
							.filter(({ value }) => value !== undefined)
							.map(({ value, id }) => ({
								where: { fieldId_memberId: { fieldId: id, memberId } },
								create: { value, fieldId: id },
								update: { value },
							})),
					},
				},
			})
		})
	},
}
