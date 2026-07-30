import { addMemberComputedValues, prisma, hidePrivateProfilValues } from '$lib/server'
import dayjs from '$lib/dayjs'

/**
 * Les adhésions de l'utilisateur, enrichies de son prochain créneau.
 * Partagé par `/me/events` et `/me/events/past`, qui doivent trier selon les
 * mêmes règles — sans quoi un évènement pourrait manquer aux deux pages.
 */
export async function getEventMembers(user: { id: string; email: string }) {
	const members = await prisma.member.findMany({
		where: { OR: [{ userId: user.id }, { email: user.email }], event: { deletedAt: null } },
		orderBy: [{ event: { startDate: { sort: 'desc', nulls: 'first' } } }, { createdAt: 'desc' }],
		include: {
			user: true,
			event: { include: { memberFields: true } },
			leaderOf: true,
			// `period` et `team` alimentent le prochain créneau du bénévole: c'est la réponse
			// à «où et quand suis-je attendu», que la date de l'évènement seule ne donne pas.
			subscribes: { include: { period: { include: { team: { select: { name: true } } } } } },
		},
	})

	const now = Date.now()

	return members
		.map(addMemberComputedValues)
		.map((member) => hidePrivateProfilValues(member))
		.map((member) => {
			// Seules les inscriptions acceptées engagent le bénévole; `request` et `denied`
			// ne doivent pas être comptées comme des créneaux à assurer.
			const accepted = member.subscribes.filter((s) => s.state === 'accepted')
			const toCome = accepted
				.filter((s) => +s.period.end >= now)
				.sort((a, b) => +a.period.start - +b.period.start)
			const next = toCome[0]
			return {
				...member,
				nbSubscribesToCome: toCome.length,
				nextSubscribe: next
					? { start: next.period.start, end: next.period.end, teamName: next.period.team.name }
					: null,
			}
		})
}

type EventMember = Awaited<ReturnType<typeof getEventMembers>>[number]

/** La fin de l'évènement décide du groupe: un évènement en cours est encore «à venir». */
const edge = (m: EventMember) => m.event.endDate ?? m.event.startDate
const isOngoing = (m: EventMember) => !!m.event.startDate && +m.event.startDate <= Date.now()

export function partitionEventMembers(members: EventMember[]) {
	const startOfToday = +dayjs().startOf('day')
	const mine = members.filter((m) => m.isValidedByUser)
	const dated = mine.filter((m) => !!edge(m))

	return {
		invitations: members.filter((m) => !m.isValidedByUser),
		// Un évènement déjà commencé est le plus urgent pour le bénévole: il passe devant,
		// puis on trie sur la fin — se fier au début ferait remonter un évènement en cours
		// au milieu des passés.
		upcoming: dated
			.filter((m) => +edge(m)! >= startOfToday)
			.sort((a, b) => +isOngoing(b) - +isOngoing(a) || +edge(a)! - +edge(b)!),
		undated: mine.filter((m) => !edge(m)),
		// Les passés repartent du plus récent.
		past: dated
			.filter((m) => +edge(m)! < startOfToday)
			.sort((a, b) => +(b.event.startDate ?? 0) - +(a.event.startDate ?? 0)),
	}
}
