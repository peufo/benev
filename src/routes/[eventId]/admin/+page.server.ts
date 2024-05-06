import { redirect } from '@sveltejs/kit'
import { tryOrFail, parseFormData } from 'fuma/server'
import { z } from 'fuma/validation'
import { prisma, permission, media } from '$lib/server'
import { modelViewCreate } from '$lib/validation'

export const load = async ({ url }) => {
	redirect(302, `${url.pathname}/members`)
}

export const actions = {
	create_view: async ({ request, locals, params: { eventId } }) => {
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
	update_view: async ({ request, locals, params: { eventId } }) => {
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
	delete_view: async ({ request, locals, params: { eventId } }) => {
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

			prisma.media.update({ where: { id: data.id, eventId }, data: { name: data.name } })
		})
	},
}
