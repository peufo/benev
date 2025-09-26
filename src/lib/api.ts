import axios, { type AxiosRequestConfig, type RawAxiosResponseHeaders } from 'axios'
import { page } from '$app/stores'
import { derived } from 'svelte/store'
import * as devalue from 'devalue'
import type { Member, Tag, User } from '@prisma/client'
import type { TeamWithComputedValues } from '$lib/server'

interface RequestConfig<Params = object, Data = object> extends AxiosRequestConfig<Data> {
	params?: Params
}

type ParamsPagination = {
	take?: number
	skip?: number
	all?: boolean
}

const _api = axios.create({ baseURL: '' })
async function get<T>(route: string, config: RequestConfig = {}) {
	const { data, headers } = await _api.get(route, config)
	ensureJson(headers, route)
	return devalue.unflatten(data) as T
}

function ensureJson(headers: RawAxiosResponseHeaders, route: string) {
	const contentType = headers['content-type']
	if (contentType !== 'application/json') {
		throw new Error(
			`Route "${route}" response Content-type is '${contentType}' instead 'application/json'`
		)
	}
}
function search<T, Params>(route: string) {
	return async (search: string, params?: Params & ParamsPagination) => {
		const config: RequestConfig = { params: { search, ...params } }
		return get<T[]>(route, config)
	}
}

function findMany<T, Params>(route: string, defaultParams?: Params) {
	return async (ids: string[], params = defaultParams) => {
		const config: RequestConfig = { params: { ids, ...params } }
		return get<T[]>(route, config)
	}
}

function methods<T, Params = object>(route: string) {
	return {
		findMany: findMany<T, Params>(route),
		search: search<T, Params>(route),
	}
}

export const api = derived(page, ({ params: { eventId } }) => {
	async function eventGet<T>(route: string, config?: RequestConfig) {
		const { data, headers } = await _api.get(`/${eventId}${route}`, config)
		ensureJson(headers, route)
		return devalue.unflatten(data) as T
	}

	return {
		eventGet,
		member: methods<Member & { user: { firstName: string; lastName: string; email: string } }>(
			`/${eventId}/api/members`
		),
		team: methods<TeamWithComputedValues, { onlyAvailable?: boolean }>(`/${eventId}/api/teams`),
		tag: methods<Tag>(`/${eventId}/api/tags`),
		user: (email: string) =>
			get<{ firstName: string; lastName: string }>(`/${eventId}/api/user`, { params: { email } }),
		rootUser: methods<User>(`/root/users`),
	}
})
