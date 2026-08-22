import { command, form, getRequestEvent } from '$app/server'
import { redirect } from '@sveltejs/kit'
import z from 'zod'
import { modelPeriodCreate, modelPeriodUpdate, validationPeriod } from '$lib/models'
import { createLog, permission, prisma } from '$lib/server'

export const createPeriod = form(
	modelPeriodCreate.extend({ redirectTo: z.string().optional() }).superRefine(validationPeriod),
	async ({ redirectTo, ...data }) => {
		const { locals } = getRequestEvent()
		const teamId = data.team.connect.id
		const actor = await permission.leaderOfTeam(teamId, locals)
		const period = await prisma.period.create({ data })
		const team = await prisma.team.findUniqueOrThrow({ where: { id: teamId } })
		await createLog('period_create', { period, team, actor })

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
		const period = await prisma.period.findUniqueOrThrow({
			where: { id },
			include: { team: true },
		})
		const actor = await permission.leaderOfTeam(period.teamId, locals)
		await prisma.period.delete({ where: { id } })
		await createLog('period_delete', { period, team: period.team, actor })
		if (redirectTo) redirect(303, redirectTo)
	}
)

/**
 * Deux appels impératifs — dupliquer la période courante, et la déplacer depuis le planning —
 * qui postaient un `FormData` construit à la main. En `command()`, les arguments passent par
 * devalue: les dates restent des dates, sans jeton de coercition.
 *
 * Ni l'un ni l'autre n'entre au journal, `updatePeriod` non plus: le glisser-déposer du planning
 * les appelle à chaque relâchement, et le bruit noierait les inscriptions.
 */
export const duplicatePeriod = command(
	z
		.object({
			teamId: z.string(),
			start: z.date(),
			end: z.date(),
			maxSubscribe: z.number().min(1),
			tagIds: z.array(z.string()),
		})
		.superRefine(validationPeriod),
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

// Le planning laisse glisser librement: c'est ici que la durée minimale est refusée, comme
// pour les formulaires.
export const movePeriod = command(
	z
		.object({ id: z.string(), teamId: z.string(), start: z.date(), end: z.date() })
		.superRefine(validationPeriod),
	async ({ id, teamId, start, end }) => {
		const { locals } = getRequestEvent()
		await permission.leaderOfTeam(teamId, locals)
		return prisma.period.update({ where: { id }, data: { start, end } })
	}
)
