import type z from 'zod'
import { fail } from '@sveltejs/kit'
import { Blob } from 'buffer'

export const formats: Record<string, (value: string) => unknown> = {
	number: (value) => Number(value),
	date: (value) => new Date(value),
	boolean: (value) => value === 'true' || value === 'on',
	json: (value) => JSON.parse(value),
}

/**
 * Recieve formData as Record<string, string>
 * Format number and boolean
 * Set empty string to null
 */
function getFormDataTyped(formData: Record<string, unknown>): Record<string, unknown> {
	for (const [key, value] of Object.entries(formData)) {
		if (value instanceof Blob) delete formData[key]
		const formatKey = key.split('_')[0]
		if (!formatKey) continue
		if (formatKey === 'relation') delete formData[key]
		if (formatKey === 'relations') delete formData[key]
		if (typeof value !== 'string' || !formData[key]) continue

		if (formats[formatKey]) {
			const k = key.replace(`${formatKey}_`, '')
			formData[k] = formats[formatKey](value)
		}
	}
	return formData
}

export async function parseFormData<Type extends z.ZodRawShape>(
	request: Request,
	shema: z.ZodObject<Type> | z.ZodEffects<z.ZodObject<Type>>,
	options: {
		arrayOperation: ArrayOperation
	} = { arrayOperation: 'connect' }
) {
	const formData: Record<string, unknown> = Object.fromEntries(await request.formData())
	const formDataTyped = getFormDataTyped({ ...formData })
	const parsed = shema.safeParse(formDataTyped)
	if (parsed.success === false) {
		return { formData, err: fail(400, { issues: parsed.error.issues }) }
	}

	const data = parseArray(parsed.data, options.arrayOperation)

	return { data, formData }
}

type ArrayOperation = 'connect' | 'set'
type ArrayParsed<
	T extends Record<string, unknown>,
	Operation extends ArrayOperation = 'connect'
> = {
	[K in keyof T]: Required<T>[K] extends string[] ? { [K in Operation]: { id: string }[] } : T[K]
}

function parseArray<T extends Record<string, unknown>>(data: T, operation: ArrayOperation) {
	const _data = Object.entries(data).reduce(
		(acc, [key, value]) => ({
			...acc,
			[key]: !Array.isArray(value) ? value : { [operation]: value.map((id) => ({ id })) },
		}),
		{} as ArrayParsed<T, typeof operation>
	)
	return _data
}
