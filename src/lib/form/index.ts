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

export type SetError = { [key: string]: (err: string) => void }
export type FormContext = { setError: SetError }

const formContextKey = {}
export const formContext = {
	ok: () => hasContext(formContextKey),
	get: () => getContext<FormContext>(formContextKey),
	set: (ctx: FormContext) => setContext<FormContext>(formContextKey, ctx),
}

type UseFormOptions = {
	beforeRequest?: (...args: Parameters<SubmitFunction>) => Promise<unknown>
	successCallback?: () => unknown
	successUpdate?: boolean
	successReset?: boolean
	successMessage?: string
}

export function useForm<Shema extends z.ZodRawShape>({
	beforeRequest,
	successCallback,
	successUpdate = true,
	successReset = true,
	successMessage = 'Succès',
}: UseFormOptions = {}) {
	type Data = Partial<z.infer<z.ZodObject<Shema>>>

	const notify = useNotify()

	const setError: SetError = {}
	formContext.set({ setError })

	function resetErrors() {
		for (const key in setError) setError[key]('')
	}

	function handleFailure({ issues, message }: { issues?: z.ZodIssue[]; message?: string }) {
		resetErrors()
		issues?.forEach((issue) => {
			const key = issue.path[0]
			if (!setError[key]) {
				console.warn('Error not showed', issue)
				return
			}
			setError[key](issue.message)
		})

		if (message) {
			notify.error(message)
			console.error(message)
		}
	}

	const submit: SubmitFunction<Data> = async (event) => {
		if (beforeRequest) await beforeRequest(event)

		return async ({ result, update }) => {
			if (result.type === 'error') {
				notify.error('Oups, erreur non gerée')
				return
			}

			if (result.type === 'failure') {
				if (result.data) handleFailure(result.data)
				else notify.warning('Le formulaire est invalide')
				return
			}

			if (result.type === 'success') {
				notify.success(successMessage)
				if (successCallback) successCallback()
				if (successUpdate) update({ reset: successReset })
				return
			}

			if (result.type === 'redirect') {
				goto(result.location, { replaceState: true })
			}
		}
	}

	return {
		submit,
	}
}
