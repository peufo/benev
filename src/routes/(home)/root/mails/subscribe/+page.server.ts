import { getMemberProfile, prisma } from '$lib/server'
import { error } from '@sveltejs/kit'

export const load = async () => {
	const jonas = await prisma.member.findFirst({ where: { user: { firstName: 'Jonas' } } })
	if (!jonas) error(404)
	const member = await getMemberProfile({ id: jonas.id })
	return {
		member,
		subscribe: await prisma.subscribe.findFirstOrThrow({
			where: { memberId: member.id },
			include: {
				member: { include: { user: true } },
				period: { include: { team: { include: { event: true } } } },
			},
		}),
	}
}
