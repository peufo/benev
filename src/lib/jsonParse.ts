export function jsonParse<Type>(text: string | null | undefined, defaultValue: Type): Type {
	try {
		if (!text) return defaultValue
		return JSON.parse(text)
	} catch {
		return defaultValue
	}
}
