import type { Period, Prisma } from '@prisma/client'
import { periodIsComplet } from '$lib/period'
import { ENGAGED_STATES, scheduleChanged } from '$lib/period/periodChange'
import { PERIOD_DEFAULT_MS } from '$lib/constant'
import { createLog, parseFormKey, prisma, sendEmailComponent } from '$lib/server'
import { EmailPeriodChanged } from '$lib/email'
import { diffChanges, hasChanges, projectPeriod, type LogActor } from '$lib/log'

export type FormDataPeriod = Awaited<ReturnType<typeof getPeriod>>

/**
 * Ce qu'un changement de créneau doit connaître avant d'écrire: l'état du secteur, les
 * responsables à qui répondre, et les inscriptions engagées avec leur membre.
 */
export const includeForPeriodChange = {
	team: {
		include: {
			event: { select: { id: true, name: true, timezone: true } },
			leaders: { where: { email: { not: null } }, select: { email: true } },
		},
	},
	subscribes: {
		where: { state: { in: [...ENGAGED_STATES] } },
		include: { member: true },
	},
} satisfies Prisma.PeriodInclude

export type PeriodForChange = Prisma.PeriodGetPayload<{ include: typeof includeForPeriodChange }>

export async function getPeriodForChange(id: string): Promise<PeriodForChange> {
	return prisma.period.findUniqueOrThrow({ where: { id }, include: includeForPeriodChange })
}

type Range = { start: Date; end: Date }

/**
 * Un courriel par inscrit·e engagé·e qui accepte les notifications, `after` nul pour une
 * suppression. La réponse va aux responsables, à défaut à l'auteur·ice du geste. Un envoi qui
 * tombe n'arrête pas les autres. Rend le nombre de destinataires.
 */
export async function notifyPeriodChange(
	period: PeriodForChange,
	after: Range | null,
	actor: { email: string }
): Promise<number> {
	const { team } = period
	const leaders = team.leaders.map(({ email }) => email as string)
	const replyTo = leaders.length ? leaders : [actor.email]
	const subject = after ? 'Ton créneau a changé' : 'Ton créneau a été supprimé'
	let notified = 0
	for (const { member } of period.subscribes) {
		if (!member.isNotifiedSubscribe || !member.email) continue
		notified++
		await sendEmailComponent(EmailPeriodChanged, {
			from: team.event.name,
			to: [member.email],
			replyTo,
			subject,
			props: {
				member,
				event: team.event,
				teamName: team.name,
				before: { start: period.start, end: period.end },
				after,
			},
			logContext: { eventId: team.eventId, memberId: member.id },
		}).catch(console.error)
	}
	return notified
}

/**
 * Ce qui suit une mise à jour, partagé par le formulaire et le planning: journal et courriels,
 * seulement quand le changement compte. En brouillon personne n'a rien reçu, et un créneau sans
 * inscription n'engage personne. Le nombre de places seul se journalise sans courriel.
 */
export async function settlePeriodUpdate(
	before: PeriodForChange,
	after: Period,
	actor: LogActor & { email: string }
): Promise<void> {
	if (before.team.state === 'draft' || !before.subscribes.length) return
	const changes = diffChanges(projectPeriod(before), projectPeriod(after))
	if (!hasChanges(changes)) return
	const notified = scheduleChanged(before, after)
		? await notifyPeriodChange(before, after, actor)
		: 0
	await createLog('period_update', { period: after, team: before.team, changes, notified, actor })
}

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
