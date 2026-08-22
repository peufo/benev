import { form, getRequestEvent } from '$app/server'
import z from 'zod'
import { modelUserContactUpdate } from '$lib/models'
import { createLog, notifyTierQuotaIfNeeded, permission, prisma } from '$lib/server'
import { diffChanges, hasChanges, projectMemberContact } from '$lib/log'

/**
 * Formulaires d'administration d'un membre. Ils sont montés depuis
 * `[eventId]/admin/members/[memberId]`, d'où `params.memberId`.
 *
 * Chacun relit le membre avant d'écrire: le journal a besoin de l'état précédent, qu'un `update`
 * seul ne rend jamais.
 */

export const setMemberIsAdmin = form(
	z.object({ isAdmin: z.boolean().default(false) }),
	async (data) => {
		const { locals, params } = getRequestEvent()
		const actor = await permission.owner(params.eventId!, locals)
		const before = await prisma.member.findUniqueOrThrow({ where: { id: params.memberId! } })
		const member = await prisma.member.update({ where: { id: params.memberId! }, data })
		if (before.isAdmin !== member.isAdmin)
			await createLog('member_role', {
				member,
				actor,
				isAdmin: { before: { isAdmin: before.isAdmin }, after: { isAdmin: member.isAdmin } },
			})
		return member
	}
)

export const setMemberIsValidedByEvent = form(
	z.object({ isValidedByEvent: z.boolean().default(false) }),
	async (data) => {
		const { locals, params } = getRequestEvent()
		const eventId = params.eventId!
		const actor = await permission.leader(eventId, locals)
		const member = await prisma.member.update({ where: { id: params.memberId! }, data })
		if (data.isValidedByEvent) await notifyTierQuotaIfNeeded(eventId)
		await createLog('member_validated', {
			member,
			actor,
			isValidedByEvent: member.isValidedByEvent,
		})
	}
)

export const updateMemberContact = form(modelUserContactUpdate, async (data) => {
	const { locals, params } = getRequestEvent()
	const actor = await permission.leader(params.eventId!, locals)
	const before = await prisma.member.findUniqueOrThrow({ where: { id: params.memberId! } })
	const member = await prisma.member.update({ where: { id: params.memberId! }, data })
	const contact = diffChanges(projectMemberContact(before), projectMemberContact(member))
	if (hasChanges(contact)) await createLog('member_update', { member, actor, contact })
	return member
})
