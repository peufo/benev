import { command, form, getRequestEvent } from '$app/server'
import { error } from '@sveltejs/kit'
import z from 'zod'
import { modelTeam, modelTeamUpdate } from '$lib/models'
import { permission, prisma } from '$lib/server'
import { cloneTeam } from '$lib/server/clone.js'

export const createTeam = form(modelTeam, async (data) => {
	const { locals, params } = getRequestEvent()
	const eventId = params.eventId!
	await permission.admin(eventId, locals)
	return prisma.team.create({ data: { ...data, eventId } })
})

export const updateTeam = form(modelTeamUpdate, async (data) => {
	const { locals } = getRequestEvent()
	const member = await permission.leaderOfTeam(data.id, locals)
	if (!member.roles.includes('admin') && data.leaders) error(403)
	return prisma.team.update({ where: { id: data.id }, data })
})

export const deleteTeam = form(z.object({ id: z.string() }), async ({ id }) => {
	const { locals, params } = getRequestEvent()
	await permission.admin(params.eventId!, locals)
	return prisma.team.delete({ where: { id } })
})

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
