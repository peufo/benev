/** Préfixe l'url avec `https://` si le schéma est absent */
export function normalizeUrl(value: string) {
	const trimmed = value.trim()
	if (!trimmed) return ''
	return `https://${trimmed.replace(/^https?:\/\//i, '')}`
}
