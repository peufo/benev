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
		async ({ data, locals, params: { eventId, badgeId } }) => {
			await permission.admin(eventId, locals)
			return prisma.badge.update({
				where: { id: badgeId, eventId },
				data,
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
