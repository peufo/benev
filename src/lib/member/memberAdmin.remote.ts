import { error } from '@sveltejs/kit'
import { form, getRequestEvent } from '$app/server'
import z from 'zod'
import { modelUserContactUpdate } from '$lib/models'
import {
	createLog,
	notifyTierQuotaIfNeeded,
	permission,
	prisma,
	sendInviteEmail,
} from '$lib/server'
// Jamais depuis le baril: la fabrique s'appelle à l'évaluation du module, or le cycle l'y
// laisserait à `undefined` selon le point d'entrée.
import { createRateLimit } from '$lib/server/rateLimit'
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

/**
 * Chaque demande met un message dans la file SMTP et écrit une ligne de journal: sans borne, le
 * bouton suffit à inonder les deux, et la boîte du membre visé avec.
 */
const isResendInviteRateLimited = createRateLimit({ windowMs: 15 * 60_000, max: 3 })

/**
 * L'invitation rejouée à la demande — le cas de l'adresse corrigée après coup. Rien n'est écrit
 * sur le membre: seul le message repart.
 */
export const resendInvite = form(async () => {
	const { locals, params } = getRequestEvent()
	const eventId = params.eventId!
	const author = await permission.leader(eventId, locals)
	const member = await prisma.member.findUniqueOrThrow({
		where: { id: params.memberId!, eventId },
		include: { event: { select: { name: true } } },
	})

	// Garde-fous serveur: la fiche n'offre le bouton dans aucun de ces deux cas.
	if (!member.email) error(400, "Ce membre n'a pas d'adresse email")
	if (member.userId) error(400, 'Ce membre a déjà lié un compte benevio')
	if (isResendInviteRateLimited(member.id))
		error(429, 'Invitation déjà renvoyée: réessaie dans quelques minutes')

	await sendInviteEmail({ ...member, email: member.email }, author)
	await createLog('member_invite', { member, actor: author, sendEmail: true, resent: true })
})
