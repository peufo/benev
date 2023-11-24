import z from 'zod'
import { fail } from '@sveltejs/kit'

export async function parseFormData<Type extends z.ZodRawShape>(
	requestOrFormData: Request | FormData,
	shap: Type,
	validation?: z.SuperRefinement<z.objectOutputType<Type, z.ZodTypeAny>>
) {
	const formData =
		requestOrFormData instanceof Request ? await requestOrFormData.formData() : requestOrFormData

	const shema = z.object(shap)
	if (validation) shema.superRefine(validation)

	const formDataObject: Record<string, unknown> = Object.fromEntries(formData)

	const parsed = shema.safeParse(formDataObject)
	if (parsed.success === false) {
		return { formData, err: fail(400, { issues: parsed.error.issues }) }
	}

	return { data: parsed.data, formData }
}
