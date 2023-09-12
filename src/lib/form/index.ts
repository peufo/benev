import type { SubmitFunction } from '@sveltejs/kit'
import type { z } from 'zod'
import { setContext, getContext, hasContext } from 'svelte'
import { useNotify } from '$lib/notify'
import { goto } from '$app/navigation'

export * from './user'
export * from './event'
export * from './team'
export * from './period'
export * from './subscribe'
export * from './page'
export * from './member'
export * from './memberField'

export type SetError = { [key: string]: (err: string) => void }
export type FormContext = { setError: SetError }

const formContextKey = {}
export const formContext = {
	ok: () => hasContext(formContextKey),
	get: () => getContext<FormContext>(formContextKey),
	set: (ctx: FormContext) => setContext<FormContext>(formContextKey, ctx),
}

type SuccessMessage = string | ((action: URL) => string)
type UseFormOptions<ReturnData> = {
	beforeRequest?: (...args: Parameters<SubmitFunction>) => Promise<unknown>
	successCallback?: (action: URL, data?: ReturnData) => unknown
	successUpdate?: boolean
	successReset?: boolean
	successMessage?: SuccessMessage
}

export function useForm<ReturnData extends Record<string, unknown>>({
	beforeRequest,
	successCallback,
	successUpdate = true,
	successReset = true,
	successMessage = 'Succès',
}: UseFormOptions<ReturnData> = {}) {
	const notify = useNotify()

	const setError: SetError = {}
	formContext.set({ setError })

	function resetErrors() {
		for (const key in setError) setError[key]('')
	}

	function handleFailure({
		issues,
		message,
	}: {
		issues?: (z.ZodIssue & { received?: string; expected?: string })[]
		message?: string
	}) {
		resetErrors()
		issues?.forEach((issue) => {
			const key = issue.path[0]
			if (!setError[key]) {
				notify.warning(
					`[${issue.code}] ${issue.path[0]} receive "${issue.received}" instead "${issue.expected}"`
				)
				console.warn('Error not visible', issue)
				return
			}
			setError[key](issue.message)
		})

		if (message) {
			notify.error(message)
			console.error(message)
		}
	}

	const submit: SubmitFunction<ReturnData> = async (event) => {
		if (beforeRequest) await beforeRequest(event)

		event.submitter?.classList.add('btn-disabled')

		return async ({ result, update, action }) => {
			event.submitter?.classList.remove('btn-disabled')

			console.log(result)
			if (result.type === 'error') {
				const { message } = result.error
				notify.error(message || 'Erreur')
				return
			}

			if (result.type === 'failure') {
				if (result.data) handleFailure(result.data)
				else notify.warning('Le formulaire est invalide')
				return
			}

			const notifySuccess = (successMessage?: SuccessMessage) => {
				if (!successMessage) return
				if (typeof successMessage === 'string') notify.success(successMessage)
				else notify.success(successMessage(action))
			}

			if (result.type === 'success') {
				notifySuccess(successMessage)
				if (successCallback) successCallback(action, result.data)
				if (successUpdate) update({ reset: successReset })
				return
			}

			if (result.type === 'redirect') {
				notifySuccess(successMessage)
				if (successCallback) successCallback(action)
				goto(result.location, { replaceState: true, invalidateAll: successUpdate })
			}
		}
	}

	return {
		submit,
	}
}
