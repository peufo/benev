import type { SubmitFunction } from '@sveltejs/kit'
import type { z } from 'zod'
import { setContext, getContext, hasContext } from 'svelte'
import { goto } from '$app/navigation'
import { useNotify } from '$lib/notify'

export type SetError = { [key: string]: (err: string) => void }
export type FormContext = { setError: SetError }

const formContextKey = {}
export const formContext = {
	get: () => {
		if (hasContext(formContextKey)) return getContext<FormContext>(formContextKey)
		return setContext<FormContext>(formContextKey, { setError: {} })
	},
}

type SuccessMessage = string | ((action: URL) => string)
type BooleanOrFunction = boolean | ((action: URL) => boolean)
type UseFormOptions<ReturnData> = {
	onSubmit?: (...args: Parameters<SubmitFunction>) => any
	onSuccess?: (action: URL, data?: ReturnData) => any
	onResetError?: () => unknown
	onError?: (err: any) => unknown
	onFail?: (failure: Record<string, any> | undefined) => unknown
	successUpdate?: BooleanOrFunction
	successReset?: BooleanOrFunction
	successMessage?: SuccessMessage
}

export function useForm<ReturnData extends Record<string, unknown>>({
	onSubmit,
	onSuccess,
	onResetError,
	onError,
	onFail,
	successUpdate = true,
	successReset = true,
	successMessage = 'Succès',
}: UseFormOptions<ReturnData> = {}) {
	const notify = useNotify()
	const { setError } = formContext.get()

	function resetErrors() {
		for (const key in setError) setError[key]('')
		if (onResetError) onResetError()
	}

	function handleFailure({
		issues,
		message,
	}: {
		issues?: (z.ZodIssue & {
			received?: string
			expected?: string
		})[]
		message?: string
	}) {
		resetErrors()
		if (issues) {
			issues.forEach((issue) => {
				const key = issue.path[0]
				if (!setError[key]) {
					notify.warning(
						`[${issue.code}] ${issue.path.join('.')} receive "${issue.received}" instead "${
							issue.expected
						}"`
					)
					console.warn('Error not visible', issue)
					return
				}
				setError[key](issue.message)
			})
		}

		if (message) {
			notify.warning(message)
			console.warn(message)
		}
	}

	const submit: SubmitFunction<ReturnData> = async (event) => {
		if (onSubmit) await onSubmit(event)

		event.submitter?.classList.add('btn-disabled')

		return async ({ result, update, action }) => {
			event.submitter?.classList.remove('btn-disabled')

			if (result.type === 'error') {
				if (onError) onError(result.error.message)
				const { message } = result.error
				notify.error(message || 'Erreur')
				return
			}

			if (result.type === 'failure') {
				if (onFail) onFail(result.data)
				if (result.data) handleFailure(result.data)
				return
			}

			function tryToRun<T extends string | boolean>(valueOrFunction: T | ((action: URL) => T)): T {
				if (typeof valueOrFunction === 'function') return valueOrFunction(action)
				return valueOrFunction
			}

			if (result.type === 'success') {
				if (successMessage) notify.success(tryToRun(successMessage))
				if (onSuccess) onSuccess(action, result.data)
				if (successUpdate) update({ reset: tryToRun(successReset) })
				return
			}

			if (result.type === 'redirect') {
				if (successMessage) notify.success(tryToRun(successMessage))
				if (onSuccess) onSuccess(action)
				return goto(result.location, { replaceState: true, invalidateAll: tryToRun(successUpdate) })
			}
		}
	}

	return {
		submit,
		resetErrors,
		setError(key: string, value: string) {
			if (!setError[key]) {
				console.warn(`Error setter for field "${key}" not exist`)
				return
			}
			setError[key](value)
		},
	}
}
