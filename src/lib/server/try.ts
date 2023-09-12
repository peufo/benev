import { type ActionFailure, fail, redirect, HttpError_1 } from '@sveltejs/kit'

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
		if ('status' in error && 'body' in error && 'message' in error.body) {
			return fail(error.status, { message: error.body.message })
		}

		if ('meta' in error && error.meta && 'cause' in error.meta) {
			return fail(400, { message: error.meta.cause })
		}
		const { message } = error as Error
		return fail(400, { message })
	} finally {
		if (isSuccess && redirectTo) {
			if (typeof redirectTo === 'string') throw redirect(302, redirectTo)
			else if (result) throw redirect(302, redirectTo(result))
			console.warn('No result can be provide in redirectTo() function. Please use a simple string.')
		}
	}
}
