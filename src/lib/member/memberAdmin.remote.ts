import { form, getRequestEvent } from '$app/server'
import z from 'zod'
import { modelUserContactUpdate } from '$lib/models'
import { zSet } from '$lib/models/form'
import { notifyTierQuotaIfNeeded, permission, prisma } from '$lib/server'

/**
 * Formulaires d'administration d'un membre. Ils sont montés depuis
 * `[eventId]/admin/members/[memberId]`, d'où `params.memberId`.
 */

export const setMemberIsAdmin = form(
	z.object({ isAdmin: z.boolean().default(false) }),
	async (data) => {
		const { locals, params } = getRequestEvent()
		await permission.owner(params.eventId!, locals)
		return prisma.member.update({ where: { id: params.memberId! }, data })
	}
)

export const setMemberLeaderOf = form(z.object({ leaderOf: zSet }), async (data) => {
	const { locals, params } = getRequestEvent()
	await permission.admin(params.eventId!, locals)
	return prisma.member.update({ where: { id: params.memberId! }, data })
})

export const setMemberIsValidedByEvent = form(
	z.object({ isValidedByEvent: z.boolean().default(false) }),
	async (data) => {
		const { locals, params } = getRequestEvent()
		const eventId = params.eventId!
		await permission.leader(eventId, locals)
		await prisma.member.update({ where: { id: params.memberId! }, data })
		if (data.isValidedByEvent) await notifyTierQuotaIfNeeded(eventId)
	}
)

export const updateMemberContact = form(modelUserContactUpdate, async (data) => {
	const { locals, params } = getRequestEvent()
	await permission.leader(params.eventId!, locals)
	return prisma.member.update({ where: { id: params.memberId! }, data })
})
