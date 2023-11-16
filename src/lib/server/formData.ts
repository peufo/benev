import type z from 'zod'
import { fail } from '@sveltejs/kit'

export async function parseFormData<Type extends z.ZodRawShape>(
	requestOrFormData: Request | FormData,
	shema: z.ZodObject<Type> | z.ZodEffects<z.ZodObject<Type>>
) {
	const formData =
		requestOrFormData instanceof Request ? await requestOrFormData.formData() : requestOrFormData

	const formDataObject: Record<string, unknown> = Object.fromEntries(formData)
	const parsed = shema.safeParse(formDataObject)
	if (parsed.success === false) {
		return { formData, err: fail(400, { issues: parsed.error.issues }) }
	}

	return { data: parsed.data, formData }
}
