import { z } from '$lib/validation'
import type { ZodRawShape } from 'zod'

export function parseQuery<Type extends ZodRawShape>(url: URL, shape: Type) {
	const queryRaw: Record<string, unknown> = {}
	Object.keys(shape).forEach((name) => {
		const param = url.searchParams.get(name)
		if (param) queryRaw[name] = param
	})
	return z.object(shape).parse(queryRaw)
}
