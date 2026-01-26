import { getUserIdOrRedirect, prisma } from '$lib/server'
import { error, redirect } from '@sveltejs/kit'

export const GET = async ({ url, locals, params: { memberId } }) => {
	const userId = await getUserIdOrRedirect(url, locals)
	const member = await prisma.member.findUnique({ where: { id: memberId } })
	if (!member) error(404)
	if (member.userId === userId) redirect(303, `/${member.eventId}/me`)
	redirect(303, `${member.eventId}/admin/members/${member.id}`)
}
