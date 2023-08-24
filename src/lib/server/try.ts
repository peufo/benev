import { type ActionFailure, fail, redirect } from '@sveltejs/kit'

export async function tryOrFail<T = unknown>(
	fn: () => Promise<T>,
	/** You can redirect on success */
	redirectTo?: string | ((res: T) => string)
): Promise<T | ActionFailure<{ message: string }>> {
	let result: T | null = null
	let isSuccess = false
	try {
		result = await fn()
		isSuccess = true
		return result
	} catch (error: any) {
		console.error(error)
		if ('meta' in error && 'cause' in error.meta) {
			return fail(400, { message: error.meta.cause })
		}
		const { message } = error as Error
		return fail(400, { message })
	} finally {
		if (isSuccess && redirectTo) {
			if (typeof redirectTo === 'string') throw redirect(301, redirectTo)
			else if (result) throw redirect(301, redirectTo(result))
			console.warn('No result can be provide in redirectTo() function. Please use a simple string.')
		}
	}
}

export async function tryOrRedirect<T = unknown>(
	fn: () => Promise<T>,
	redirectTo: string
): Promise<T> {
	try {
		return await fn()
	} catch (error: any) {
		console.error(error)
		throw redirect(301, redirectTo)
	}
}
