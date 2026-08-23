import { redirect } from '@sveltejs/kit'
import { prisma } from '$lib/server'
import { resolve } from '$app/paths'

export const load = async ({ params: { badgeId, eventId } }) => {
	const badge = await prisma.badge.findUnique({
		where: { id: badgeId, eventId },
		include: {
			labelField: true,
			typeField: true,
			accessDaysField: true,
			accessSectorsField: true,
		},
	})
	if (!badge) redirect(302, resolve('/[eventId]/admin/pages', { eventId }))

	return {
		badge,
	}
}
