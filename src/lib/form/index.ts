import type { SubmitFunction } from '@sveltejs/kit'
import type { z } from 'zod'
import { setContext, getContext } from 'svelte'
import { useNotify } from '$lib/notify'

export * from './user'
export * from './event'

export type SetError = { [key: string]: (err: string) => void }
export type FormContext = { setError: SetError }

const formContextKey = {}
export const formContext = {
	get: () => getContext<FormContext>(formContextKey),
	set: (ctx: FormContext) => setContext<FormContext>(formContextKey, ctx),
}

type Callback = () => unknown

export function useForm<Shema extends z.ZodRawShape>(successCallback: Callback = () => {}) {
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

	const submit: SubmitFunction<Data> = (event) => {
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
				notify.success('Succès')
				update()
				successCallback()
				return
			}
		}
	}

	return {
		submit,
	}
}
