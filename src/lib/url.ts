export function isHttpUrl(value: string | null | undefined): value is string {
	if (!value) return false
	try {
		const { protocol } = new URL(value)
		return protocol === 'http:' || protocol === 'https:'
	} catch {
		return false
	}
}

/** Préfixe l'url avec `https://` si le schéma est absent */
export function normalizeUrl(value: string) {
	const trimmed = value.trim()
	if (!trimmed) return ''
	return `https://${trimmed.replace(/^https?:\/\//i, '')}`
}
