import type { Address } from 'nodemailer/lib/mailer'

export type Recipients = string | Address | Array<string | Address> | undefined

/**
 * La RFC 2606 réserve `.test`: aucun domaine qui s'y termine ne résout, une adresse pareille
 * ne peut donc être qu'une fixture. On la retire des destinataires — la garde vaut aussi en
 * production, où `EMAIL_DISABLED` n'est pas positionné.
 */
export function withoutTestRecipients(recipients: Recipients): {
	kept: Recipients
	dropped: string[]
} {
	if (!recipients) return { kept: undefined, dropped: [] }

	// Une chaîne peut porter plusieurs destinataires séparés par des virgules. Un nom
	// d'affichage contenant une virgule doit être guillemeté — benev n'en construit pas.
	const entries: Array<string | Address> = []
	for (const entry of Array.isArray(recipients) ? recipients : [recipients]) {
		if (typeof entry !== 'string') {
			entries.push(entry)
			continue
		}
		for (const part of entry.split(',')) {
			const trimmed = part.trim()
			if (trimmed) entries.push(trimmed)
		}
	}

	const dropped: string[] = []
	const kept = entries.filter((entry) => {
		const address = extractAddress(entry)
		if (!address.endsWith('.test')) return true
		dropped.push(address)
		return false
	})

	return { kept: kept.length ? kept : undefined, dropped }
}

/** Accepte `a@b.test` comme `Nom <a@b.test>`. */
function extractAddress(recipient: string | Address): string {
	if (typeof recipient !== 'string') return recipient.address.trim().toLowerCase()
	const angled = recipient.match(/<([^>]*)>/)
	return (angled ? angled[1] : recipient).trim().toLowerCase()
}
