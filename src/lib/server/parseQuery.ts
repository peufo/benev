import { z } from '$lib/validation'
import { fail } from '@sveltejs/kit'
import type { ZodRawShape } from 'zod'

export function parseQuery<Type extends ZodRawShape>(url: URL, shape: Type) {
	const queryRaw: Record<string, unknown> = {}
	Object.keys(shape).forEach((name) => {
		const param = url.searchParams.get(name)
		if (param) queryRaw[name] = param
	})
	const parsed = z.object(shape).safeParse(queryRaw)
	if (parsed.success === false) {
		return { err: fail(400, { issues: parsed.error.issues }) }
	}
	return { data: parsed.data }
}
