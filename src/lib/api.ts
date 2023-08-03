import axios, { type AxiosRequestConfig, type RawAxiosResponseHeaders } from 'axios'
import type { User } from '@prisma/client'

interface RequestConfig<Params = any, Data = any> extends AxiosRequestConfig<Data> {
	params: Params
}

const _api = axios.create({ baseURL: '' })

function ensureJson(headers: RawAxiosResponseHeaders, route: string) {
	const contentType = headers['content-type']
	if (contentType !== 'application/json') {
		throw new Error(
			`Route "${route}" response Content-type is '${contentType}' instead 'application/json'`
		)
	}
}
function search<T extends unknown>(route: string) {
	return async (search: string) => {
		const config: RequestConfig = { params: { search } }
		const { data, headers } = await _api.get<T[]>(route, config)
		ensureJson(headers, route)
		return data
	}
}

function findOne<T extends unknown>(route: string) {
	return async (id: string) => {
		const { data, headers } = await _api.get<T>(`${route}/${id}`)
		ensureJson(headers, route)
		return data
	}
}

function findMany<T extends unknown>(route: string) {
	return async (ids: string[]) => {
		const config: RequestConfig = { params: { ids } }
		const { data, headers } = await _api.get<T[]>(route, config)
		ensureJson(headers, route)
		return data
	}
}

function methods<T extends unknown>(route: string) {
	return {
		search: search<T>(route),
		findOne: findOne<T>(route),
		findMany: findMany<T>(route),
	}
}

export const api = {
	user: methods<User>('/users'),
}
