import { redirect } from '@sveltejs/kit'
import { tryOrFail, prisma, parseFormData, permission, media } from '$lib/server'
import { viewCreate, z } from '$lib/validation'

export const load = async ({ url }) => {
	redirect(302, `${url.pathname}/members`)
}

export const actions = {
	create_view: async ({ request, locals, params: { eventId } }) => {
		const member = await permission.leader(eventId, locals)
		const { err, data } = await parseFormData(request, viewCreate)
		if (err) return err
		return tryOrFail(() =>
			prisma.view.create({
				data: {
					...data,
					eventId,
					authorId: member.id,
				},
			})
		)
	},
	update_view: async ({ request, locals, params: { eventId } }) => {
		const member = await permission.leader(eventId, locals)
		const { err, data } = await parseFormData(request, { ...viewCreate, id: z.string() })
		if (err) return err
		return tryOrFail(() =>
			prisma.view.update({
				where: { id: data.id, eventId },
				data: {
					...data,
					eventId,
					authorId: member.id,
				},
			})
		)
	},
	delete_view: async ({ request, locals, params: { eventId } }) => {
		await permission.leader(eventId, locals)
		const { err, data } = await parseFormData(request, { id: z.string() })
		if (err) return err
		return tryOrFail(() =>
			prisma.view.delete({
				where: { id: data.id, eventId },
			})
		)
	},
	upload_media: async ({ request, locals, params: { eventId } }) => {
		const member = await permission.admin(eventId, locals)

		const { err, data, formData } = await parseFormData(request, { name: z.string() })
		if (err) return err

		return tryOrFail(async () => {
			const mediaUploaded = await media.upload(formData, {
				data: {
					eventId,
					name: data.name,
					createdById: member.userId,
				},
			})
			return { media: mediaUploaded }
		})
	},
	delete_media: async ({ request, locals, params: { eventId } }) => {
		await permission.admin(eventId, locals)
		const { err, data } = await parseFormData(request, { id: z.string() })
		if (err) return err
		return tryOrFail(() => media.delete({ id: data.id, eventId }))
	},
	edit_media: async ({ request, locals, params: { eventId } }) => {
		await permission.admin(eventId, locals)
		const { err, data } = await parseFormData(request, { id: z.string(), name: z.string() })
		if (err) return err
		return tryOrFail(() =>
			prisma.media.update({ where: { id: data.id, eventId }, data: { name: data.name } })
		)
	},
}
