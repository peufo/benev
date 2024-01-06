import axios, { type AxiosRequestConfig, type RawAxiosResponseHeaders } from 'axios'
import { page } from '$app/stores'
import { derived } from 'svelte/store'
import * as devalue from 'devalue'
import type { Member } from '@prisma/client'
import type { TeamWithComputedValues } from '$lib/server'

interface RequestConfig<Params = any, Data = any> extends AxiosRequestConfig<Data> {
	params: Params
}

type ParamsPagination = {
	take?: number
	skip?: number
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
function search<T extends unknown, P = {}>(route: string) {
	return async (search: string, params?: P & ParamsPagination) => {
		const config: RequestConfig = { params: { search, ...params } }
		const { data, headers } = await _api.get(route, config)
		ensureJson(headers, route)
		return devalue.unflatten(data) as T[]
	}
}

function findMany<T extends unknown, P = {}>(route: string, defaultParams?: P) {
	return async (ids: string[], params = defaultParams) => {
		const config: RequestConfig = { params: { ids, ...params } }
		const { data, headers } = await _api.get(route, config)
		ensureJson(headers, route)
		return devalue.unflatten(data) as T[]
	}
}

function methods<T extends unknown, P = {}>(route: string) {
	return {
		findMany: findMany<T, P>(route),
		search: search<T, P>(route),
	}
}

export const api = derived(page, ({ params: { eventId } }) => ({
	member: methods<Member & { user: { firstName: string; lastName: string; email: string } }>(
		`/${eventId}/api/members`
	),
	team: methods<TeamWithComputedValues, { onlyAvailable?: boolean }>(`/${eventId}/api/teams`),
}))
