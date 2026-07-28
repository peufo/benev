export function jsonParse<Type>(
	content: string | null | undefined | Type,
	defaultValue: Type
): Type {
	try {
		if (!content) return defaultValue
		if (typeof content !== 'string') return content
		return JSON.parse(content)
	} catch {
		return defaultValue
	}
}
