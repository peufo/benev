import { error } from '@sveltejs/kit'
import { tryOrFail, parseFormData } from 'fuma/server'
import { z, type ZodObj } from 'fuma'
import { permission, prisma, redirectToAuth, redirectToRegister } from '$lib/server'
import type { Field, FieldType } from '@prisma/client'

export const load = async ({ url, parent, params: { eventId } }) => {
	const { member, user } = await parent()
	if (!user) throw redirectToAuth(url)
	if (
		!member ||
		!member.isValidedByUser ||
		!member.isUserProfileCompleted ||
		!member.isMemberProfileCompleted
	)
		throw redirectToRegister(eventId, url)

	const memberId = member.id
	return {
		member,
		memberTeams: await prisma.team.findMany({
			where: { periods: { some: { subscribes: { some: { memberId } } } } },
			include: {
				periods: {
					where: { subscribes: { some: { memberId } } },
					orderBy: { start: 'asc' },
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

			const formData = await request.formData()
			const editOwnProfile = member.id === formData.get('memberId')
			if (!editOwnProfile && !isLeader) error(401)

			const modelMemberProfile = buildModelMemberProfile(fields, isLeader && !editOwnProfile)

			const { data } = await parseFormData(formData, modelMemberProfile)

			const { memberId, ...values } = data
			if (typeof memberId !== 'string') throw Error('memberId is required')

			return await prisma.member.update({
				where: { id: memberId },
				data: {
					profileJson: {
						...member.profileJson,
						...values,
					},
				},
			})
		})
	},
}

function buildModelMemberProfile(fields: Field[], isPartial: boolean) {
	type ProfileValue = string | string[] | number | boolean | undefined
	const model: ZodObj<{ memberId: string } & Record<string, ProfileValue>> = {
		memberId: z.string(),
	}

	const modelByType = {
		boolean: z.boolean(),
		number: z.number(),
		string: z.string().min(1, { message: 'Valeur manquante' }),
		textarea: z.string().min(1, { message: 'Valeur manquante' }),
		select: z.string().min(1, { message: 'Valeur manquante' }),
		multiselect: z.array(z.string()),
	} satisfies ZodObj<Record<FieldType, ProfileValue>>

	const modelByTypeOptional = {
		boolean: z.boolean().optional(),
		number: z.number().optional(),
		string: z.string().optional(),
		textarea: z.string().optional(),
		select: z.string().optional(),
		multiselect: z.array(z.string()).optional(),
	} satisfies ZodObj<Record<FieldType, ProfileValue>>

	fields.forEach((f) => {
		if (isPartial || !f.required) model[f.id] = modelByTypeOptional[f.type]
		else model[f.id] = modelByType[f.type]
	})

	return model
}
