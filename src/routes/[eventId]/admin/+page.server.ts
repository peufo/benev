import { redirect } from '@sveltejs/kit'
import { tryOrFail, parseFormData, formAction } from 'fuma/server'
import { z } from 'fuma/validation'
import { prisma, permission, media } from '$lib/server'
import {
	modelPeriodCreate,
	modelPeriodUpdate,
	modelViewCreate,
	validationPeriod,
} from '$lib/models'

export const load = async ({ url }) => {
	redirect(302, `${url.pathname}/members`)
}

export const actions = {
	view_create: async ({ request, locals, params: { eventId } }) => {
		const member = await permission.leader(eventId, locals)

		return tryOrFail(async () => {
			const { data } = await parseFormData(request, modelViewCreate)

			return prisma.view.create({
				data: {
					...data,
					eventId,
					authorId: member.id,
				},
			})
		})
	},
	view_update: async ({ request, locals, params: { eventId } }) => {
		const member = await permission.leader(eventId, locals)

		return tryOrFail(async () => {
			const { data } = await parseFormData(request, { ...modelViewCreate, id: z.string() })
			return prisma.view.update({
				where: { id: data.id, eventId },
				data: {
					...data,
					eventId,
					authorId: member.id,
				},
			})
		})
	},
	view_delete: async ({ request, locals, params: { eventId } }) => {
		await permission.leader(eventId, locals)

		return tryOrFail(async () => {
			const { data } = await parseFormData(request, { id: z.string() })
			return prisma.view.delete({
				where: { id: data.id, eventId },
			})
		})
	},
	upload_media: async ({ request, locals, params: { eventId } }) => {
		const member = await permission.admin(eventId, locals)

		return tryOrFail(async () => {
			const { data, formData } = await parseFormData(request, { name: z.string() })

			return media.upload(formData, {
				data: {
					eventId,
					name: data.name,
					createdById: member.userId,
				},
			})
		})
	},
	delete_media: async ({ request, locals, params: { eventId } }) => {
		await permission.admin(eventId, locals)
		return tryOrFail(async () => {
			const { data } = await parseFormData(request, { id: z.string() })
			return media.delete({ id: data.id, eventId })
		})
	},
	edit_media: async ({ request, locals, params: { eventId } }) => {
		await permission.admin(eventId, locals)

		return tryOrFail(async () => {
			const { data } = await parseFormData(request, { id: z.string(), name: z.string() })

			await prisma.media.update({ where: { id: data.id, eventId }, data: { name: data.name } })
		})
	},
	period_create: formAction(
		{ ...modelPeriodCreate, redirectTo: z.string() },
		async ({ data, locals }) => {
			await permission.leaderOfTeam(data.team.connect.id, locals)
			const { redirectTo, ..._data } = data
			const period = await prisma.period.create({
				data: _data,
			})
			return { period, redirectTo }
		},
		{
			validation: validationPeriod,
			redirectTo: ({ period, redirectTo }) => {
				const [path, params] = redirectTo.split('?')
				const searchParams = new URLSearchParams(params)
				searchParams.set('form_period', period.id)
				return `${path}?${searchParams.toString()}`
			},
		}
	),
	period_update: formAction(
		modelPeriodUpdate,
		async ({ data, locals }) => {
			await permission.leaderOfTeam(data.team.connect.id, locals)
			return prisma.period.update({
				where: { id: data.id },
				data,
			})
		},
		{
			validation: validationPeriod,
		}
	),
	period_delete: formAction(
		{
			id: z.string(),
			redirectTo: z.string(),
		},
		async ({ data, locals }) => {
			const period = await prisma.period.findUniqueOrThrow({ where: { id: data.id } })
			await permission.leaderOfTeam(period.teamId, locals)
			await prisma.period.delete({ where: { id: data.id } })
			return data.redirectTo
		},
		{ redirectTo: (url) => url }
	),
}
