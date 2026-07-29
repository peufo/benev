import { redirect } from '@sveltejs/kit'
import { prisma } from '$lib/server'

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
	if (!badge) redirect(302, `/${eventId}/admin/pages`)

	return {
		badge,
	}
}
