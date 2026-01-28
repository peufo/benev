import { modelBadgeUpdate } from '$lib/models'
import { redirect } from '@sveltejs/kit'
import { formAction } from 'fuma/server'
import { prisma, permission } from '$lib/server'

export const load = async ({ params: { badgeId, eventId } }) => {
	const badge = await prisma.badge.findUnique({ where: { id: badgeId, eventId } })
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

			// TODO: check field.type

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
