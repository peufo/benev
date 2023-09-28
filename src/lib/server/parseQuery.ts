import { fail } from '@sveltejs/kit'
import { z } from 'zod'

export function parseQuery<Type extends z.ZodRawShape>(url: URL, shema: z.ZodObject<Type>) {
	const queryRaw: Record<string, unknown> = {}
	Object.keys(shema.shape).forEach((name) => {
		const param = url.searchParams.get(name)
		if (param) queryRaw[name] = param
	})
	const parsed = shema.partial().safeParse(queryRaw)
	if (parsed.success === false) {
		return { err: fail(400, { message: 'Invalid arguments' }) }
	}
	return { query: parsed.data }
}
