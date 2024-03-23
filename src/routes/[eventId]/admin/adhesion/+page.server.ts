import { parseFormData, prisma, tryOrFail, permission } from '$lib/server'
import { z } from '$lib/validation'

import { eventMemberSettings, memberFieldCreate, memberFieldUpdate } from '$lib/validation'

export const load = async ({ parent, params: { eventId } }) => {
	const { event } = await parent()

	return {
		memberFields: await prisma.field.findMany({
			orderBy: { position: 'asc' },
			where: { eventId },
		}),
		gifts: await prisma.gift.findMany({
			where: { eventId },
			include: { conditions: true },
		}),
		eventCounts: {
			membersValided: await prisma.member.count({
				where: { eventId, isValidedByEvent: true },
			}),
			membersLicenced: await prisma.member.count({
				where: { eventId, licence: { isNot: null } },
			}),
			memberLicencesAvailable: await prisma.licence.count({
				where: { ownerId: event.ownerId, type: 'member', memberId: null },
			}),
		},
		eventLicenceAvailable: await prisma.licence.findFirst({
			where: { ownerId: event.ownerId, type: 'event', eventId: null },
		}),
	}
}

export const actions = {
	create_field: async ({ request, locals, params: { eventId } }) => {
		await permission.admin(eventId, locals)
		const { err, data } = await parseFormData(request, memberFieldCreate)
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
		const { err, data } = await parseFormData(request, { id: z.string() })
		if (err) return err

		return tryOrFail(() =>
			prisma.field.delete({
				where: { id: data.id, eventId },
			})
		)
	},
	update_field: async ({ request, locals, params: { eventId } }) => {
		await permission.admin(eventId, locals)

		const { err, data } = await parseFormData(request, memberFieldUpdate)
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
	set_member_settings: async ({ request, locals, params: { eventId } }) => {
		await permission.admin(eventId, locals)
		const { err, data } = await parseFormData(request, eventMemberSettings)
		if (err) return err
		return tryOrFail(() =>
			prisma.event.update({
				where: { id: eventId },
				data,
			})
		)
	},
}
