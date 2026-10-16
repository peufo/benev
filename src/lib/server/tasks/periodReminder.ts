import type { Task } from '../scheduler'
import { prisma } from '../prisma'
import { sendEmailComponent } from '../email'
import { EmailPeriodReminder } from '#lib/email/index.js'
import { formatRange } from '#lib/formatRange.js'
import { planReminders, REMINDER_MAX_HOURS } from '#lib/period/periodReminder.js'

const HOUR = 60 * 60_000

/**
 * Rappelle leur créneau aux inscrit·es accepté·es (voir `#lib/period/periodReminder.js`). Le
 * marqueur `remindedAt` se pose avant l'envoi et exige d'être vide: une fenêtre rejouée après un
 * échec ne double jamais un courriel, au prix d'en perdre un si le processus tombe entre les deux.
 * Une demande en attente n'est pas un engagement, et un secteur en brouillon n'a rien annoncé.
 */
export const periodReminder: Task = {
	name: 'period-reminder',
	every: 60_000,
	async run({ since, until }) {
		const periods = await prisma.period.findMany({
			where: {
				start: { gt: since, lte: new Date(until.getTime() + REMINDER_MAX_HOURS * HOUR) },
				team: {
					state: { not: 'draft' },
					event: { reminderHours: { gt: 0 }, deletedAt: null, state: { not: 'archived' } },
				},
				subscribes: { some: { state: 'accepted', remindedAt: null } },
			},
			include: {
				team: {
					include: {
						event: true,
						leaders: { where: { email: { not: null } }, select: { email: true } },
					},
				},
				subscribes: {
					where: { state: 'accepted', remindedAt: null },
					include: { member: true },
				},
			},
		})

		let reminded = 0
		for (const period of planReminders(
			periods.map((period) => ({ ...period, event: period.team.event })),
			{ since, until }
		)) {
			const { team, event } = period
			const leaders = team.leaders.map(({ email }) => email as string)
			const replyTo = leaders.length ? leaders : event.email ? [event.email] : undefined
			for (const { id, member } of period.subscribes) {
				const { count } = await prisma.subscribe.updateMany({
					where: { id, state: 'accepted', remindedAt: null },
					data: { remindedAt: until },
				})
				if (!count) continue
				reminded++
				if (!member.isNotifiedReminder || !member.email) continue
				await sendEmailComponent(EmailPeriodReminder, {
					from: event.name,
					to: [member.email],
					replyTo,
					subject: `Rappel : ${team.name}, ${formatRange(period, event.timezone)}`,
					props: { member, event, teamName: team.name, period },
					logContext: { eventId: event.id, memberId: member.id },
				}).catch(console.error)
			}
		}
		return reminded
	},
}
