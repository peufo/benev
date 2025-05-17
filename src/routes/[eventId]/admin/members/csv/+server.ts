import { getMembers, type MemberWithComputedValue } from '../getMembers'
import { prisma, permission } from '$lib/server'
import { getAge } from '$lib/utils'
import { getCSV, z } from 'fuma'
import { parseQuery } from 'fuma/server'
import { msToHours } from '../msToHours'

export const GET = async ({ url, locals, params: { eventId } }) => {
	await permission.leader(eventId, locals)
	const event = await prisma.event.findUniqueOrThrow({
		where: { id: eventId },
		include: { memberFields: true, teams: true },
	})
	url.searchParams.set('all', 'true')
	const { members } = await getMembers(event, url)
	const teamsName = event.teams.reduce<Record<string, string>>(
		(acc, t) => ({ ...acc, [t.id]: t.name }),
		{}
	)
	const { locale, timeZone } = parseQuery(url, {
		locale: z.string().nullish(),
		timeZone: z.string().nullish(),
	})

	function toLocaleString(date: Date): string {
		if (!locale || !timeZone) return date.toJSON()
		try {
			return date.toLocaleString(locale, { timeZone })
		} catch (e) {
			return 'Error'
		}
	}

	const columns: Record<string, (member: MemberWithComputedValue) => string | number> = {
		name: (m) => `${m.user.firstName} ${m.user.lastName}`,
		createdAt: (m) => toLocaleString(m.createdAt),
		email: (m) => m.user.email,
		phone: (m) => m.user.phone?.replace(/^\+/, "'+") || '',
		age: (m) => getAge(m.user.birthday),
		subscribeTeamsValided: (m) =>
			m.subscribes
				.filter((s) => s.state === 'accepted')
				.map((s) => teamsName[s.period.teamId])
				.filter(isUnique)
				.join(', '),
		subscribesTeamsRequest: (m) =>
			m.subscribes
				.filter((s) => s.state === 'request')
				.map((s) => teamsName[s.period.teamId])
				.filter(isUnique)
				.join(', '),
		hours: (m) => msToHours(m.workTime),
		leaderOf: (m) => m.leaderOf.map((team) => team.name).join(', '),
		...event.memberFields.reduce(
			(acc, cur) => ({
				...acc,
				[cur.name]: (m: MemberWithComputedValue) => {
					const value = (m.profileJson && m.profileJson[cur.id]) || ''
					if (typeof value === 'string') return value.replaceAll('\r\n', ' ')
					return JSON.stringify(value)
				},
			}),
			{}
		),
	}
	const csv = getCSV(members, columns)
	return new Response(csv, {
		headers: {
			'Content-type': 'text/csv; charset=utf-8',
			'Content-Disposition': 'attachment; filename="members.csv"',
		},
	})
}

function isUnique<Item>(item: Item, index: number, self: Item[]): boolean {
	return self.indexOf(item) === index
}
