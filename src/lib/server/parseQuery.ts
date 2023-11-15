import type { z } from 'zod'

export function parseQuery<Type extends z.ZodRawShape>(url: URL, shema: z.ZodObject<Type>) {
	const queryRaw: Record<string, unknown> = {}
	Object.keys(shema.shape).forEach((name) => {
		const param = url.searchParams.get(name)
		if (param) queryRaw[name] = param
	})
	return shema.parse(queryRaw)
}
