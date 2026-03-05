import { defaultEmailModels } from '$lib/email/models'
import type { Page, PageType, Period, Prisma, Team } from '@prisma/client'

type ExcludeProps = 'id' | 'createdAt' | 'updatedAt' | 'eventId'
export function cloneData<T extends object>(data: T) {
	const { id, createdAt, updatedAt, eventId, ...rest } = data as Record<ExcludeProps, unknown>
	return rest as Omit<T, ExcludeProps>
}

export function cloneTeam(
	team: Team & { periods: Period[] },
	deltaTime: number
): Prisma.TeamCreateWithoutEventInput {
	return {
		name: team.name,
		description: team.description,
		closeSubscribing:
			team.closeSubscribing && new Date(team.closeSubscribing.getTime() + deltaTime),
		// TODO: fix fields references
		//conditions: team.conditions || undefined,
		position: team.position,
		periods: {
			create: team.periods.map((p) => clonePeriod(p, deltaTime)),
		},
	}
}

function clonePeriod(period: Period, deltaTime: number): Prisma.PeriodCreateWithoutTeamInput {
	return {
		maxSubscribe: period.maxSubscribe,
		start: new Date(period.start.getTime() + deltaTime),
		end: new Date(period.end.getTime() + deltaTime),
	}
}

export function clonePages(eventPages: Page[]): Prisma.PageCreateManyEventInput[] {
	const home = cloneData(
		eventPages.find((p) => p.type === 'home') || {
			type: 'home' as PageType,
			title: 'Bienvenue',
			path: 'bienvenue',
			content: 'null',
		}
	)
	const emails = defaultEmailModels.map((page) => {
		const eventPage = eventPages.find((p) => p.path === page.path)
		return eventPage ? cloneData(eventPage) : page
	})
	const rest = eventPages.filter((p) => p.type !== 'home' && p.type !== 'email').map(cloneData)
	return [home, ...emails, ...rest]
}
