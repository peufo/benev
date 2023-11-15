import type z from 'zod'
import { fail } from '@sveltejs/kit'

export async function parseFormData<Type extends z.ZodRawShape>(
	requestOrFormData: Request | FormData,
	shema: z.ZodObject<Type> | z.ZodEffects<z.ZodObject<Type>>
) {
	const formData: Record<string, unknown> = Object.fromEntries(
		requestOrFormData instanceof Request ? await requestOrFormData.formData() : requestOrFormData
	)

	const parsed = shema.safeParse(formData)
	if (parsed.success === false) {
		return { formData, err: fail(400, { issues: parsed.error.issues }) }
	}

	return { data: parsed.data, formData }
}
