import { defaultEmailModels } from '#lib/email/models.js'
import type { Page, PageState, PageType, Period, Prisma, Team } from '@prisma/client'

type ExcludeProps = 'id' | 'createdAt' | 'updatedAt' | 'eventId'
export function cloneData<T extends object>(data: T) {
	const { id, createdAt, updatedAt, eventId, ...rest } = data as Record<ExcludeProps, unknown>
	return rest as Omit<T, ExcludeProps>
}

/** `shift` décale chaque date: `shiftDays` en garde l'heure murale, changement d'heure compris. */
export function cloneTeam(
	team: Team & { periods: Period[] },
	shift: (date: Date) => Date
): Prisma.TeamCreateWithoutEventInput {
	return {
		name: team.name,
		description: team.description,
		// Une copie n'a encore prévenu personne: quitter le brouillon reste le geste qui l'ouvre
		// aux bénévoles, et qui envoie les demandes en attente.
		state: 'draft',
		overflowPermitted: team.overflowPermitted,
		closeSubscribing: team.closeSubscribing && shift(team.closeSubscribing),
		conditions: team.conditions || undefined,
		position: team.position,
		periods: {
			create: team.periods.map((p) => clonePeriod(p, shift)),
		},
	}
}

function clonePeriod(
	period: Period,
	shift: (date: Date) => Date
): Prisma.PeriodCreateWithoutTeamInput {
	return {
		maxSubscribe: period.maxSubscribe,
		start: shift(period.start),
		end: shift(period.end),
	}
}

export function clonePages(eventPages: Page[]): Prisma.PageCreateManyEventInput[] {
	const home = cloneData(
		eventPages.find((p) => p.type === 'home') || {
			type: 'home' as PageType,
			state: 'published' as PageState,
			title: 'Bienvenue',
			path: 'bienvenue',
			content: 'null',
		}
	)
	const emails = defaultEmailModels.map((page) => {
		const eventPage = eventPages.find((p) => p.path === page.path)
		return eventPage ? cloneData(eventPage) : page
	})
	// L'accueil et les courriels n'ont pas de brouillon; les autres pages se republient à la main.
	const rest = eventPages
		.filter((p) => p.type !== 'home' && p.type !== 'email')
		.map((p) => ({ ...cloneData(p), state: 'draft' as PageState }))
	return [home, ...emails, ...rest]
}
