export function jsonParse<Type>(value: string | null | undefined | Type, defaultValue: Type): Type {
	try {
		if (!value) return defaultValue
		if (typeof value === 'string') return JSON.parse(value)
		return value
	} catch {
		return defaultValue
	}
}
