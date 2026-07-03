import { formAction } from 'fuma/server'
import { modelEventUpdate } from '$lib/models'
import { permission, prisma, uploadImages } from '$lib/server'
import {
	modelTagCreate,
	modelTagUpdate,
	modelMilestoneCreate,
	modelMilestoneUpdate,
} from '$lib/models'
import { z } from 'fuma'

export const load = async ({ params }) => ({
	page: await prisma.page.findFirst({ where: { eventId: params.eventId, type: 'home' } }),
})

export const actions = {
	event_update: formAction(
		modelEventUpdate,
		async ({ params, locals, data, formData }) => {
			const member = await permission.admin(params.eventId, locals)
			const event = await prisma.event.update({
				where: { id: params.eventId },
				data,
			})
			await uploadImages(formData, event.id, member.userId)
			return event
		},
		{
			redirectTo: ({ id }) => `/${id}/admin/event`,
		}
	),
	event_delete: formAction(
		{},
		async ({ params, locals }) => {
			await permission.admin(params.eventId, locals)
			await prisma.event.delete({
				where: { id: params.eventId },
			})
		},
		{ redirectTo: '/me' }
	),
	tag_create: formAction(modelTagCreate, async ({ params: { eventId }, locals, data }) => {
		await permission.leader(eventId, locals)
		return prisma.tag.create({
			data: {
				...data,
				eventId,
			},
		})
	}),
	tag_update: formAction(modelTagUpdate, async ({ params: { eventId }, locals, data }) => {
		await permission.leader(eventId, locals)
		return prisma.tag.update({
			where: { id: data.id, eventId },
			data,
		})
	}),
	tag_delete: formAction({ id: z.string() }, async ({ params: { eventId }, locals, data }) => {
		await permission.leader(eventId, locals)
		return prisma.tag.delete({
			where: { id: data.id, eventId },
		})
	}),
	milestone_create: formAction(
		modelMilestoneCreate,
		async ({ params: { eventId }, locals, data }) => {
			await permission.leader(eventId, locals)
			return prisma.milestone.create({
				data: { ...data, eventId },
			})
		}
	),
	milestone_update: formAction(
		modelMilestoneUpdate,
		async ({ params: { eventId }, locals, data }) => {
			await permission.leader(eventId, locals)
			return prisma.milestone.update({
				where: { id: data.id, eventId },
				data,
			})
		}
	),
	milestone_delete: formAction(
		{ id: z.string() },
		async ({ params: { eventId }, locals, data }) => {
			await permission.leader(eventId, locals)
			return prisma.milestone.delete({
				where: { id: data.id, eventId },
			})
		}
	),
}
