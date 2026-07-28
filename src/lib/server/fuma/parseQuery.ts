import type { ZodRawShape } from 'zod'
import { error } from '@sveltejs/kit'
import { z } from '$lib/fuma/validation/zod.js'

export function parseQuery<Type extends ZodRawShape>(url: URL, shape: Type) {
	const queryRaw: Record<string, unknown> = {}
	Object.keys(shape).forEach((name) => {
		const param = url.searchParams.get(name)
		if (param) queryRaw[name] = param
	})
	const parsed = z.object(shape).safeParse(queryRaw)
	if (parsed.success === false) error(400, { message: parsed.error.message })
	return parsed.data
}
