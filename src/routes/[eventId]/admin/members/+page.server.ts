import { ensureFieldsWithFilterAreVisibles, parseQuery } from 'fuma/server'
import { getMemberProfile, prisma } from '$lib/server'
import { getMembers, membersFilterShape } from './getMembers'
import { z } from 'fuma'

export const load = async ({ url, parent, params: { eventId } }) => {
	const isFilterKey = (key: string) => key.startsWith('field_') || key in membersFilterShape
	ensureFieldsWithFilterAreVisibles('members', url, isFilterKey)

	const { event, member } = await parent()

	const { form_member_profile } = parseQuery(url, {
		form_member_profile: z.string().optional(),
	})

	const { members, stats } = await getMembers(event, url)
	return {
		members,
		stats,
		views: await prisma.view.findMany({
			where: { eventId, key: 'members' },
		}),
		memberProfile: await undefinedOr(form_member_profile, (id) =>
			getMemberProfile({ id }, { member })
		),
		badges: await prisma.badge.findMany({
			where: { eventId },
			select: { id: true, name: true },
		}),
	}
}

function undefinedOr<ReturnType>(value: string | undefined, cb: (v: string) => ReturnType) {
	if (value === undefined) return undefined
	return cb(value)
}
