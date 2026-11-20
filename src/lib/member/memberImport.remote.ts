import { command, getRequestEvent } from '$app/server'
import type { Field } from '@prisma/client'
import {
	createLog,
	getTierQuotaRemaining,
	invitedMemberDefaults,
	isUniqueConstraintError,
	notifyTierQuotaIfNeeded,
	permission,
	prisma,
	sendInviteEmail,
} from '#lib/server/index.js'
import { isInviteLimited } from '#lib/server/inviteBulk.js'
import { isInviteHeld } from '#lib/event/eventAccess.js'
import { modelMemberImport } from '#lib/models/index.js'
import { MAX_IMPORT_INVITES, memberName, type ProfileValue } from '#lib/member/import/index.js'

export type ImportResult = {
	line: number
	name: string
	email: string
	status: 'imported' | 'skipped' | 'failed'
	memberId?: string
	reason?: string
	invited?: boolean
	/** L'invitation attend la publication de l'évènement. */
	held?: boolean
}

/**
 * Un lot de lignes du fichier, déjà converties par `buildMembers`. Chaque ligne réussit ou échoue
 * seule: une adresse déjà prise n'emporte pas le reste du lot.
 */
export const importMembers = command(modelMemberImport, async ({ source, sendEmail, rows }) => {
	const { locals, params } = getRequestEvent()
	const eventId = params.eventId!
	const author = await permission.admin(eventId, locals)

	const [fields, event, existing, remaining] = await Promise.all([
		prisma.field.findMany({ where: { eventId } }),
		prisma.event.findUniqueOrThrow({
			where: { id: eventId },
			select: { name: true, state: true },
		}),
		prisma.member.findMany({
			where: { eventId, email: { in: rows.flatMap((row) => row.email ?? []) } },
			select: { email: true, firstName: true, lastName: true },
		}),
		getTierQuotaRemaining(author.event),
	])
	// Chaque membre importé est approuvé: sans ce plafond, un lot dépasserait le palier d'autant.
	let quota = remaining
	// Un membre importé n'a jamais de rôle: dans un évènement fermé, son invitation attend.
	const holdInvites = isInviteHeld(event.state, { hasRole: false })

	const results: ImportResult[] = []
	for (const { line, profile, birthday, ...contact } of rows) {
		const name = memberName(contact)
		const email = contact.email ?? ''
		const result = (status: ImportResult['status'], extra?: Partial<ImportResult>) =>
			results.push({ line, name, email, status, ...extra })

		if (!name) {
			result('skipped', { reason: 'Nom manquant' })
			continue
		}
		const already = existing.find((member) => member.email === contact.email)
		if (already) {
			result('skipped', { reason: `Déjà membre: ${already.firstName} ${already.lastName}` })
			continue
		}
		if (quota <= 0) {
			result('skipped', {
				reason: "Quota de ton offre atteint: change d'offre pour importer le reste",
			})
			continue
		}

		const wanted = sendEmail && !!contact.email
		const isHeld = wanted && holdInvites
		const sendNow = wanted && !holdInvites
		try {
			const member = await prisma.member.create({
				data: {
					...contact,
					birthday: birthday ? new Date(birthday) : undefined,
					profileJson: filterProfile(profile, fields),
					eventId,
					...invitedMemberDefaults(contact.email),
					...(isHeld && { invitePendingAt: new Date() }),
				},
			})
			quota--

			const limited = sendNow && isInviteLimited(author.userId ?? author.id)
			// Envoyée avant le journal, pour qu'il ne dise pas « invité·e » d'un message refusé.
			const invited =
				sendNow &&
				!limited &&
				(await sendInviteEmail({ ...member, email: member.email!, event }, author, { bulk: true }))
			await createLog('member_invite', {
				member,
				actor: author,
				sendEmail: invited,
				held: isHeld,
				importedFrom: source,
			})

			result('imported', {
				memberId: member.id,
				invited,
				held: isHeld,
				reason: limited
					? `Plus de ${MAX_IMPORT_INVITES} invitations en un jour: à renvoyer depuis sa fiche`
					: sendNow && !invited
						? "File d'e-mails saturée: invitation à renvoyer depuis sa fiche"
						: undefined,
			})
		} catch (err) {
			// Une adresse prise entre la lecture ci-dessus et l'écriture: un doublon, pas une panne.
			if (isUniqueConstraintError(err, 'email')) {
				result('skipped', { reason: "Déjà membre de l'évènement" })
				continue
			}
			console.error(err)
			result('failed', { reason: "Erreur à l'écriture" })
		}
	}

	if (results.some(({ status }) => status === 'imported')) await notifyTierQuotaIfNeeded(eventId)
	return results
})

/** Seuls les champs de l'évènement, et seulement une valeur du type que le champ attend. */
function filterProfile(profile: Record<string, ProfileValue>, fields: Field[]) {
	const filtered: PrismaJson.MemberProfile = {}
	for (const field of fields) {
		const value = profile[field.id]
		if (value === undefined) continue
		const expected = {
			string: typeof value === 'string',
			textarea: typeof value === 'string',
			select: typeof value === 'string',
			number: typeof value === 'number' && Number.isFinite(value),
			boolean: typeof value === 'boolean',
			multiselect: Array.isArray(value),
		}[field.type]
		if (expected) filtered[field.id] = value
	}
	return filtered
}
