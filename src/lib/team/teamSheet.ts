import type { SubscribeState } from '@prisma/client'
import dayjs, { type Dayjs } from '$lib/dayjs'

type Person = { firstName: string; lastName: string; phone: string | null }

export type TeamSheetInput = {
	name: string
	leaders: Person[]
	periods: {
		start: Date
		end: Date
		maxSubscribe: number
		tags: { name: string; color: string }[]
		subscribes: { state: SubscribeState; member: Person }[]
	}[]
}

export type TeamSheetRow = { name: string; phone: string; pending: boolean }

export type TeamSheetPeriod = {
	label: string
	tags: { name: string; color: string }[]
	count: string
	rows: TeamSheetRow[]
}

export type TeamSheet = {
	title: string
	range: string | null
	leaders: string[]
	/** Les créneaux regroupés par jour de début: la date se lit une fois, en tête du groupe. */
	days: { label: string; periods: TeamSheetPeriod[] }[]
}

/**
 * Ce que la feuille d'un secteur imprime, sans rien savoir de pdfkit. Seules les inscriptions
 * `accepted` et `request` y figurent, comme dans la jauge: un refus ou une annulation n'a rien
 * à faire sur la feuille de qui sera là.
 */
export function teamSheet(team: TeamSheetInput, timezone: string): TeamSheet {
	const tz = (date: Date) => dayjs(date).tz(timezone)
	const fullName = ({ firstName, lastName }: Person) => `${firstName} ${lastName}`

	const periods = team.periods.toSorted((a, b) => a.start.getTime() - b.start.getTime())
	const first = periods.at(0)
	const last = periods.toSorted((a, b) => a.end.getTime() - b.end.getTime()).at(-1)

	return {
		title: team.name,
		range: first && last ? formatRange(tz(first.start), tz(last.end)) : null,
		leaders: team.leaders.map((leader) =>
			leader.phone ? `${fullName(leader)} (${leader.phone})` : fullName(leader)
		),
		days: groupByDay(
			periods.map((period) => {
				const start = tz(period.start)
				const end = tz(period.end)
				const subscribes = period.subscribes
					.filter(({ state }) => state === 'accepted' || state === 'request')
					.toSorted(
						(a, b) =>
							Number(a.state === 'request') - Number(b.state === 'request') ||
							a.member.lastName.localeCompare(b.member.lastName, 'fr') ||
							a.member.firstName.localeCompare(b.member.firstName, 'fr')
					)
				return {
					day: capitalize(start.format('dddd DD.MM.YY')),
					// Un créneau qui passe minuit nomme le jour de sa fin, sans quoi « 22:00 – 02:00 » se
					// lirait comme une durée négative.
					label: `${start.format('HH:mm')} – ${end.format(end.isSame(start, 'day') ? 'HH:mm' : 'dddd HH:mm')}`,
					tags: period.tags.map(({ name, color }) => ({ name, color })),
					count: `${subscribes.length} / ${period.maxSubscribe}`,
					rows: subscribes.map(({ state, member }) => ({
						name: fullName(member),
						phone: member.phone ?? '',
						pending: state === 'request',
					})),
				}
			})
		),
	}
}

function groupByDay(periods: (TeamSheetPeriod & { day: string })[]): TeamSheet['days'] {
	const days: TeamSheet['days'] = []
	for (const { day, ...period } of periods) {
		const last = days.at(-1)
		if (last?.label === day) last.periods.push(period)
		else days.push({ label: day, periods: [period] })
	}
	return days
}

function capitalize(text: string) {
	return text.charAt(0).toUpperCase() + text.slice(1)
}

function formatRange(start: Dayjs, end: Dayjs) {
	if (start.isSame(end, 'day')) return start.format('dddd DD.MM.YY')
	return `${start.format('dddd DD.MM.YY')} au ${end.format('dddd DD.MM.YY')}`
}
