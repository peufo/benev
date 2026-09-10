import { periodIsComplet } from '$lib/period'
import { PERIOD_DEFAULT_MS } from '$lib/constant'
import { parseFormKey, prisma } from '$lib/server'

export type FormDataPeriod = Awaited<ReturnType<typeof getPeriod>>

async function getPeriod(id: string) {
	const period = await prisma.period.findUniqueOrThrow({
		where: { id },
		include: {
			team: true,
			tags: true,
			subscribes: {
				include: {
					member: true,
				},
			},
		},
	})

	return {
		...period,
		isComplet: periodIsComplet(period),
	}
}

/**
 * Le début proposé pour un créneau que rien ne date encore. Les sources vont du plus précis au
 * plus général: enchaîner le secteur là où il s'arrête, sinon se caler sur la chronologie de
 * l'évènement. Sans aucune des trois, `undefined` laisse le formulaire à son heure ronde.
 */
async function getDefaultPeriodStart(eventId: string, teamId?: string) {
	if (teamId) {
		const last = await prisma.period.findFirst({
			where: { teamId, team: { eventId } },
			orderBy: { end: 'desc' },
			select: { end: true },
		})
		if (last) return last.end
	}

	const milestone = await prisma.milestone.findFirst({
		where: { eventId },
		orderBy: { timestamp: 'asc' },
		select: { timestamp: true },
	})
	if (milestone) return milestone.timestamp

	// `startDate` est tenu à jour par l'extension Prisma: c'est le début du premier créneau de
	// l'évènement, tous secteurs confondus.
	const event = await prisma.event.findUnique({
		where: { id: eventId },
		select: { startDate: true },
	})
	return event?.startDate ?? undefined
}

export const getPeriodForm = async (periodIdOrJson: string | undefined, eventId: string) => {
	const period = await parseFormKey(periodIdOrJson, getPeriod, (period) => {
		if (!period) return undefined
		return {
			...period,
			...(period.start ? { start: new Date(period.start) } : {}),
			...(period.end ? { end: new Date(period.end) } : {}),
		}
	})

	// Un créneau existant, ou un cliqué-glissé sur la grille, portent déjà leurs dates.
	if (!period || period.id || period.start) return period

	const start = await getDefaultPeriodStart(eventId, period.team?.id)
	if (!start) return period
	return { ...period, start, end: new Date(start.getTime() + PERIOD_DEFAULT_MS) }
}
