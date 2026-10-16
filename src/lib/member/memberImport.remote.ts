import { command, getRequestEvent } from '$app/server'
import type { Field } from '@prisma/client'
import {
	createAvatarPlaceholder,
	createLog,
	isUniqueConstraintError,
	notifyTierQuotaIfNeeded,
	permission,
	prisma,
	sendInviteEmail,
} from '#lib/server/index.js'
import { createRateLimit } from '#lib/server/rateLimit.js'
import { modelMemberImport } from '#lib/models/index.js'
import { MAX_IMPORT_INVITES, type ProfileValue } from '#lib/member/import/index.js'

export type ImportResult = {
	line: number
	name: string
	email: string
	status: 'imported' | 'skipped' | 'failed'
	memberId?: string
	reason?: string
	invited?: boolean
}

/**
 * Le plafond par import est tenu par le client, qui envoie par lots: seul le serveur voit tous les
 * lots d'un évènement, et c'est ici que la file d'e-mails est vraiment protégée.
 */
const isInviteLimited = createRateLimit({ windowMs: 60 * 60 * 1000, max: MAX_IMPORT_INVITES })

/**
 * Un lot de lignes du fichier, déjà converties par `buildMembers`. Chaque ligne réussit ou échoue
 * seule: une adresse déjà prise n'emporte pas le reste du lot.
 */
export const importMembers = command(modelMemberImport, async ({ source, sendEmail, rows }) => {
	const { locals, params } = getRequestEvent()
	const eventId = params.eventId!
	const author = await permission.admin(eventId, locals)

	const fields = await prisma.field.findMany({ where: { eventId } })
	const event = await prisma.event.findUniqueOrThrow({ where: { id: eventId } })
	const existing = await prisma.member.findMany({
		where: { eventId, email: { in: rows.flatMap((row) => row.email ?? []) } },
		select: { email: true, firstName: true, lastName: true },
	})

	const results: ImportResult[] = []
	for (const { line, profile, birthday, ...contact } of rows) {
		const name = `${contact.firstName} ${contact.lastName}`.trim()
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

		try {
			const member = await prisma.member.create({
				data: {
					...contact,
					birthday: birthday ? new Date(birthday) : undefined,
					profileJson: filterProfile(profile, fields),
					eventId,
					isValidedByEvent: true,
					avatarPlaceholder: createAvatarPlaceholder(),
					isNotifiedSubscribe: !!contact.email,
					isNotifiedReminder: !!contact.email,
					isNotifiedLeaderOfSubscribe: !!contact.email,
					isNotifiedAdminOfNewMember: !!contact.email,
				},
			})

			const invited = sendEmail && !!member.email && !isInviteLimited(eventId)
			await createLog('member_invite', {
				member,
				actor: author,
				sendEmail: invited,
				importedFrom: source,
			})
			if (invited) await sendInviteEmail({ ...member, email: member.email!, event }, author)

			result('imported', { memberId: member.id, invited })
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
