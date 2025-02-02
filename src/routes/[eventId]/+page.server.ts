import { formAction } from 'fuma/server'
import { modelEventUpdate } from '$lib/models'
import { permission, prisma, uploadImages } from '$lib/server'

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
			await uploadImages(formData, event.id, member.user.id)
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
}
