import axios, { type AxiosRequestConfig, type RawAxiosResponseHeaders } from 'axios'
import type { Member, Period, Team } from '@prisma/client'
import { derived } from 'svelte/store'
import { page } from '$app/stores'

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
	return async (search: string, take = 5) => {
		const config: RequestConfig = { params: { search, take } }
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
		// findOne: findOne<T>(route),
		findMany: findMany<T>(route),
		search: search<T>(route),
	}
}

export const api = derived(page, ({ params: { eventId } }) => ({
	member: methods<Member & { user: { firstName: string; lastName: string; email: string } }>(
		`/${eventId}/api/members`
	),
	team: methods<Team & { periods: Period[] }>(`/${eventId}/api/teams`),
}))
