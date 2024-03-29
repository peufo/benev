import { error } from '@sveltejs/kit'
import {
	parseFormData,
	permission,
	prisma,
	redirectToAuth,
	redirectToRegister,
	tryOrFail,
} from '$lib/server'
import { z, type ZodObj } from '$lib/validation'
import type { Field, FieldType } from '@prisma/client'
import type { ZodType } from 'zod'

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

			const model = buildMemberProfileModel(fields, isLeader && !editOwnProfile)

			const { data, err } = await parseFormData(formData, model)
			if (err) return err

			const { memberId, ...values } = data
			if (!memberId) throw Error('memberId is required')

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

function buildMemberProfileModel(fields: Field[], isPartial: boolean) {
	type ProfileValue = string | string[] | number | boolean | undefined
	const model: ZodObj<{ memberId: string } & Record<string, ProfileValue>> = {
		memberId: z.string(),
	}

	const modelByType: Record<FieldType, ZodType<ProfileValue>> = {
		boolean: z.boolean(),
		number: z.number(),
		string: z.string().min(1, { message: 'Valeur manquante' }),
		textarea: z.string().min(1, { message: 'Valeur manquante' }),
		select: z.string().min(1, { message: 'Valeur manquante' }),
		multiselect: z.array(z.string()),
	}
	const modelByTypeOptional: Record<FieldType, ZodType<ProfileValue>> = {
		boolean: z.boolean().optional(),
		number: z.number().optional(),
		string: z.string().optional(),
		textarea: z.string().optional(),
		select: z.string().optional(),
		multiselect: z.array(z.string()).optional(),
	}

	fields.forEach((f) => {
		if (isPartial || !f.required) model[f.id] = modelByTypeOptional[f.type]
		else model[f.id] = modelByType[f.type]
	})

	return model
}
