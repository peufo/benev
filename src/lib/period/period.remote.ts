import { command, form, getRequestEvent } from '$app/server'
import { redirect } from '@sveltejs/kit'
import z from 'zod'
import { modelPeriodCreate, modelPeriodUpdate, validationPeriod } from '$lib/models'
import { permission, prisma } from '$lib/server'

export const createPeriod = form(
	modelPeriodCreate.extend({ redirectTo: z.string().optional() }).superRefine(validationPeriod),
	async ({ redirectTo, ...data }) => {
		const { locals } = getRequestEvent()
		await permission.leaderOfTeam(data.team.connect.id, locals)
		const period = await prisma.period.create({ data })

		if (!redirectTo) return period
		const [path, params] = redirectTo.split('?')
		const searchParams = new URLSearchParams(params)
		searchParams.set('form_period', period.id)
		redirect(303, `${path}?${searchParams.toString()}`)
	}
)

export const updatePeriod = form(modelPeriodUpdate.superRefine(validationPeriod), async (data) => {
	const { locals } = getRequestEvent()
	await permission.leaderOfTeam(data.team.connect.id, locals)
	return prisma.period.update({ where: { id: data.id }, data })
})

export const deletePeriod = form(
	z.object({ id: z.string(), redirectTo: z.string().optional() }),
	async ({ id, redirectTo }) => {
		const { locals } = getRequestEvent()
		const period = await prisma.period.findUniqueOrThrow({ where: { id } })
		await permission.leaderOfTeam(period.teamId, locals)
		await prisma.period.delete({ where: { id } })
		if (redirectTo) redirect(303, redirectTo)
	}
)

/**
 * Deux appels impératifs — dupliquer la période courante, et la déplacer depuis le planning —
 * qui postaient un `FormData` construit à la main. En `command()`, les arguments passent par
 * devalue: les dates restent des dates, sans jeton de coercition.
 */
export const duplicatePeriod = command(
	z.object({
		teamId: z.string(),
		start: z.date(),
		end: z.date(),
		maxSubscribe: z.number().min(1),
		tagIds: z.array(z.string()),
	}),
	async ({ teamId, tagIds, ...data }) => {
		const { locals } = getRequestEvent()
		await permission.leaderOfTeam(teamId, locals)
		return prisma.period.create({
			data: {
				...data,
				team: { connect: { id: teamId } },
				tags: { connect: tagIds.map((id) => ({ id })) },
			},
		})
	}
)

export const movePeriod = command(
	z.object({ id: z.string(), teamId: z.string(), start: z.date(), end: z.date() }),
	async ({ id, teamId, start, end }) => {
		const { locals } = getRequestEvent()
		await permission.leaderOfTeam(teamId, locals)
		return prisma.period.update({ where: { id }, data: { start, end } })
	}
)
