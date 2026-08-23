import { command, form, getRequestEvent, query } from '$app/server'
import type { Prisma } from '@prisma/client'
import { error, redirect } from '@sveltejs/kit'
import z from 'zod'
import { modelTeam, modelTeamUpdate } from '$lib/models'
import { createLog, permission, prisma, useAddTeamComputedValues } from '$lib/server'
import { cloneTeam } from '$lib/server/clone.js'
import { diffChanges, hasChanges, projectTeam } from '$lib/log'

export const createTeam = form(modelTeam, async (data) => {
	const { locals, params } = getRequestEvent()
	const eventId = params.eventId!
	const actor = await permission.admin(eventId, locals)
	const team = await prisma.team.create({ data: { ...data, eventId } })
	await createLog('team_create', { team, actor })
	return team
})

/** Les responsables sont journalisés par leurs noms: un diff de cuid ne se lit pas. */
const includeLeadersForLog = {
	leaders: { select: { firstName: true, lastName: true } },
} satisfies Prisma.TeamInclude

export const updateTeam = form(modelTeamUpdate, async ({ leaders, ...data }) => {
	const { locals } = getRequestEvent()
	const member = await permission.leaderOfTeam(data.id, locals)
	const isAdmin = member.roles.includes('admin')
	if (!isAdmin && leaders) error(403)
	const before = await prisma.team.findUniqueOrThrow({
		where: { id: data.id },
		include: includeLeadersForLog,
	})
	const team = await prisma.team.update({
		where: { id: data.id },
		include: includeLeadersForLog,
		// Retirer le dernier responsable ne transmet aucune clé, exactement comme un formulaire
		// où `InputLeaders` n'a pas été rendu. C'est le rôle qui tranche: un admin voit toujours
		// le champ, donc l'absence vaut « plus aucun responsable »; pour les autres elle vaut
		// « champ jamais rendu », et la relation ne bouge pas.
		data: { ...data, leaders: isAdmin ? (leaders ?? { set: [] }) : undefined },
	})
	const changes = diffChanges(projectTeam(before), projectTeam(team))
	if (hasChanges(changes)) await createLog('team_update', { team, changes, actor: member })
	return team
})

/**
 * `redirectTo` quitte le secteur côté serveur: rendu depuis son propre volet, le formulaire
 * verrait sinon le `load` de la page rejouer sur un enregistrement qui n'existe plus.
 */
export const deleteTeam = form(
	z.object({ id: z.string(), redirectTo: z.string().optional() }),
	async ({ id, redirectTo }) => {
		const { locals, params } = getRequestEvent()
		const actor = await permission.admin(params.eventId!, locals)
		const team = await prisma.team.delete({ where: { id } })
		await createLog('team_delete', { team, actor })
		if (redirectTo) redirect(303, redirectTo)
		return team
	}
)

export const cloneTeamForm = form(
	z.object({ id: z.string(), deltaTime: z.number().default(0) }),
	async ({ id, deltaTime }) => {
		const { locals, params } = getRequestEvent()
		const eventId = params.eventId!
		await permission.admin(eventId, locals)
		const [teams, team] = await Promise.all([
			prisma.team
				.findMany({ where: { eventId }, select: { name: true } })
				.then((res) => res.map((t) => t.name)),
			prisma.team.findUniqueOrThrow({
				where: { id, eventId },
				include: { periods: true, leaders: true },
			}),
		])
		const clone = cloneTeam(team, deltaTime)
		// leaders are not handle by cloneTeam()
		clone.leaders = { connect: team.leaders.map(({ id }) => ({ id })) }
		return prisma.team.create({
			data: {
				...clone,
				event: { connect: { id: eventId } },
				name: getTeamCopyName(clone.name, teams),
			},
		})
	}
)

/** Le glisser-déposer transmettait un JSON dans un `FormData`: l'ordre suffit. */
export const reorderTeams = command(z.array(z.string()), async (ids) => {
	const { locals, params } = getRequestEvent()
	await permission.admin(params.eventId!, locals)
	return prisma.$transaction(
		ids.map((id, position) => prisma.team.update({ where: { id }, data: { position } }))
	)
})

function getTeamCopyName(initalName: string, teams: string[]): string {
	const name = initalName.endsWith(' copie') ? initalName : `${initalName} copie`
	if (!teams.includes(name)) return name
	let suffix = 2
	while (teams.includes(`${name} ${suffix}`)) suffix++
	return `${name} ${suffix}`
}

/** Alimente l'`InputSelect` de secteur de `PeriodForm`. */
export const searchTeams = query(z.object({ search: z.string() }), async ({ search }) => {
	const { locals, params } = getRequestEvent()
	const eventId = params.eventId!
	await permission.leader(eventId, locals)
	return prisma.team.findMany({
		where: { eventId, name: { contains: search } },
		take: 10,
	})
})

/**
 * Alimente le choix de secteur de `MemberCreateSubscribeDialog`, qui a besoin des périodes et
 * de leur disponibilité: un responsable ne peut inscrire quelqu'un que sur une place libre.
 */
export const searchAvailableTeams = query(z.object({ search: z.string() }), async ({ search }) => {
	const { locals, params } = getRequestEvent()
	const eventId = params.eventId!
	const member = await permission.leader(eventId, locals)
	const addTeamComputedValues = useAddTeamComputedValues({ member, event: member.event })

	return prisma.team
		.findMany({
			where: { eventId, name: { contains: search } },
			include: {
				leaders: true,
				periods: {
					include: {
						subscribes: { include: { member: { select: { userId: true } } } },
						tags: true,
					},
				},
			},
			take: 10,
		})
		.then((teams) => teams.map(addTeamComputedValues).filter((team) => team.isAvailable))
})
