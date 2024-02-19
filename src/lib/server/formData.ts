import z from 'zod'
import { fail } from '@sveltejs/kit'

export async function parseFormData<Type extends z.ZodRawShape>(
	requestOrFormData: Request | FormData,
	shaps: Type | Type[],
	validation?: z.SuperRefinement<z.objectOutputType<Type, z.ZodTypeAny>>
) {
	const formData =
		requestOrFormData instanceof Request ? await requestOrFormData.formData() : requestOrFormData

	const [firstShap, ...unionShaps] = Array.isArray(shaps) ? shaps : [shaps]
	const shema = z.object(firstShap).superRefine(validation || (() => {}))
	unionShaps.forEach((shap) => shema.or(z.object(shap)))

	const formDataFlateObject: Record<string, unknown> = Object.fromEntries(formData)
	const formDataObject = flateToNeestedObject(formDataFlateObject)
	const parsed = shema.safeParse(formDataObject)
	if (parsed.success === false) {
		type Issue = z.ZodIssue & { received: string; expected: string; unionErrors?: z.ZodError[] }
		const issueToPOJO = (issue: Issue) => ({
			message: issue.message,
			path: issue.path,
			code: issue.code,
			received: issue.received,
			expected: issue.expected,
			unionErrors: issue.unionErrors?.map((err) => err.flatten()),
		})
		const issues = (parsed.error.issues as Issue[]).map(issueToPOJO)
		return { formData, err: fail(400, { issues }) }
	}

	return { data: parsed.data, formData }
}

function flateToNeestedObject(flatObject: Record<string, unknown>) {
	const obj: Record<string, unknown> = {}
	Object.entries(flatObject).forEach(([key, value]) => {
		set(obj, key, value)
	})

	return obj
}

function set(obj: Record<string, any>, path: string | number | (string | number)[], value: any) {
	if (typeof path === 'number') path = [path]
	if (!path || path.length === 0) return obj
	if (typeof path === 'string') return set(obj, path.split('.').map(getKey), value)

	const currentPath = path[0]
	const currentValue = obj[currentPath]

	if (path.length === 1) {
		if (currentValue === undefined) {
			obj[currentPath] = value
		}
		return currentValue
	}

	if (currentValue === undefined) {
		//check if we assume an array
		if (typeof path[1] === 'number') {
			obj[currentPath] = []
		} else {
			obj[currentPath] = {}
		}
	}

	return set(obj[currentPath], path.slice(1), value)
}

function getKey(key: string) {
	const intKey = parseInt(key)
	if (intKey.toString() === key) return intKey
	return key
}
