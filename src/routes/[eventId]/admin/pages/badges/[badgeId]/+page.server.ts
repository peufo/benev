import { modelBadgeUpdate } from '$lib/models'
import { redirect } from '@sveltejs/kit'
import { formAction } from 'fuma/server'
import { prisma, permission } from '$lib/server'
import type { Field, FieldType } from '@prisma/client'

export const load = async ({ params: { badgeId, eventId } }) => {
	const badge = await prisma.badge.findUnique({
		where: { id: badgeId, eventId },
		include: {
			typeField: true,
			accessDaysField: true,
			accessSectorsField: true,
		},
	})
	if (!badge) redirect(302, `/${eventId}/admin/pages`)

	return {
		badge,
		medias: await prisma.media.findMany({
			where: { OR: [{ eventId }, { logoOf: { id: eventId } }, { posterOf: { id: eventId } }] },
		}),
	}
}

export const actions = {
	badge_update: formAction(
		modelBadgeUpdate,
		async ({ data: { backgroundId, logoId, ...data }, locals, params: { eventId, badgeId } }) => {
			await permission.admin(eventId, locals)

			await Promise.all([
				checkFieldType(data.typeField.connect?.id, 'select'),
				checkFieldType(data.accessDaysField.connect?.id, 'multiselect'),
				checkFieldType(data.accessSectorsField.connect?.id, 'multiselect'),
			])

			return prisma.badge.update({
				where: { id: badgeId, eventId },
				data: {
					background: idToConnectionData(backgroundId),
					logo: idToConnectionData(logoId),
					...data,
				},
			})
		}
	),
	badge_delete: formAction({}, async ({ locals, params: { eventId, badgeId } }) => {
		await permission.admin(eventId, locals)

		return prisma.badge.delete({
			where: { id: badgeId },
		})
	}),
}

function idToConnectionData(id?: string | null) {
	if (!id) return { disconnect: true }
	return { connect: { id } }
}

async function checkFieldType(id: string | undefined, type: FieldType) {
	if (!id) return
	const field = await prisma.field.findUniqueOrThrow({ where: { id } })
	if (field.type !== type) throw new Error(`The "${field.label}" field is not of type "${type}"`)
}
