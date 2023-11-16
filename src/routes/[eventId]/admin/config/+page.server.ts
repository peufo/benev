import { eventShemaUpdate, memberFieldShema, memberFieldShemaUpdate } from '$lib/validation'
import { parseFormData, prisma, tryOrFail, permission, media } from '$lib/server'
import { z } from '$lib/validation'
import { FORMAT_A3 } from '$lib/constants'

export const load = async ({ params }) => ({
	memberFields: await prisma.field.findMany({
		orderBy: { position: 'asc' },
		where: {
			eventId: params.eventId,
		},
	}),
})

export const actions = {
	update_event: async ({ request, locals, params: { eventId } }) => {
		const member = await permission.admin(eventId, locals)
		const { err, data, formData } = await parseFormData(request, eventShemaUpdate)
		if (err) return err

		return tryOrFail(
			async () => {
				await media.upload(formData, {
					key: 'poster',
					where: { posterOf: { id: eventId } },
					data: {
						name: `Affiche`,
						createdById: member.user.id,
						posterOf: { connect: { id: eventId } },
					},
					sizes: [
						[FORMAT_A3.x, FORMAT_A3.y],
						[FORMAT_A3.x * 2, FORMAT_A3.y * 2],
					],
				})

				return prisma.event.update({
					where: { id: eventId },
					data,
				})
			},
			eventId !== data.id ? `/${data.id}/admin/config?section=infos` : undefined
		)
	},
	delete_event: async ({ locals, params: { eventId } }) => {
		await permission.admin(eventId, locals)

		return tryOrFail(
			() =>
				prisma.event.delete({
					where: { id: eventId },
				}),
			'/'
		)
	},
	create_field: async ({ request, locals, params: { eventId } }) => {
		await permission.admin(eventId, locals)
		const { err, data } = await parseFormData(request, memberFieldShema)
		if (err) return err

		return tryOrFail(async () => {
			const nbFields = await prisma.field.count({ where: { eventId } })
			return prisma.field.create({
				data: { ...data, eventId, position: nbFields },
			})
		})
	},
	delete_field: async ({ request, locals, params: { eventId } }) => {
		await permission.admin(eventId, locals)
		const { err, data } = await parseFormData(request, z.object({ id: z.string() }))
		if (err) return err

		return tryOrFail(() =>
			prisma.field.delete({
				where: { id: data.id, eventId },
			})
		)
	},
	update_field: async ({ request, locals, params: { eventId } }) => {
		await permission.admin(eventId, locals)

		const { err, data } = await parseFormData(request, memberFieldShemaUpdate)
		if (err) return err

		return tryOrFail(() =>
			prisma.field.update({
				where: { id: data.id },
				data,
			})
		)
	},
	reorder_fields: async ({ request, locals, params: { eventId } }) => {
		await permission.admin(eventId, locals)
		const formData: Record<string, unknown> = Object.fromEntries(await request.formData())

		const updates: { id: string; position: number }[] = []
		Object.entries(formData).forEach(([id, position]) => {
			if (typeof position === 'string') updates.push({ id, position: +position })
		})

		return tryOrFail(() =>
			prisma.$transaction(
				updates.map(({ id, position }) =>
					prisma.field.update({ where: { id }, data: { position } })
				)
			)
		)
	},
}
