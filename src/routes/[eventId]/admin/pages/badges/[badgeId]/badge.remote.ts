import type { FieldType } from '@prisma/client'
import { form, getRequestEvent } from '$app/server'
import { redirect } from '@sveltejs/kit'
import { modelBadgeUpdate } from '$lib/models'
import { permission, prisma } from '$lib/server'

export const updateBadge = form(modelBadgeUpdate, async ({ backgroundId, logoId, ...data }) => {
	const { locals, params } = getRequestEvent()
	const eventId = params.eventId!
	await permission.admin(eventId, locals)

	await Promise.all([
		checkFieldType(connectedId(data.typeField), 'select'),
		checkFieldType(connectedId(data.accessDaysField), 'multiselect'),
		checkFieldType(connectedId(data.accessSectorsField), 'multiselect'),
		checkFieldType(connectedId(data.labelField), 'select', 'string'),
	])

	return prisma.badge.update({
		where: { id: params.badgeId!, eventId },
		data: {
			background: idToConnectionData(backgroundId),
			logo: idToConnectionData(logoId),
			...data,
		},
	})
})

export const deleteBadge = form(async () => {
	const { locals, params } = getRequestEvent()
	const eventId = params.eventId!
	await permission.admin(eventId, locals)

	await prisma.badge.delete({ where: { id: params.badgeId! } })
	redirect(303, `/${eventId}/admin/pages`)
})

function connectedId(relation: { connect: { id: string } } | { disconnect: true }) {
	return 'connect' in relation ? relation.connect.id : undefined
}

function idToConnectionData(id?: string | null) {
	if (!id) return { disconnect: true }
	return { connect: { id } }
}

async function checkFieldType(id: string | undefined, ...types: FieldType[]) {
	if (!id) return
	const field = await prisma.field.findUniqueOrThrow({ where: { id } })
	if (!types.includes(field.type))
		throw new Error(`The "${field.label}" field is not of type ["${types}"]`)
}
