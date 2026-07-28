import { jsonParse } from '$lib/fuma'

export function parseFormKey<Fun extends (key: string) => unknown>(
	key: string | undefined,
	fun: Fun,
	transformJson?: (
		data: Partial<Awaited<ReturnType<Fun>>>
	) => undefined | Partial<Awaited<ReturnType<Fun>>>
): undefined | ReturnType<Fun> | Partial<Awaited<ReturnType<Fun>>> {
	if (key === undefined) return undefined
	const isCUID = key.length === 25 && key.match(/\w{25}/)
	if (isCUID) return fun(key) as ReturnType<Fun>
	const data = jsonParse<Partial<Awaited<ReturnType<Fun>>>>(key, {})
	return transformJson ? transformJson(data) : data
}
