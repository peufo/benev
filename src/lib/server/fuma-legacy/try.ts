import { type ActionFailure, fail, redirect } from '@sveltejs/kit'
import type { Issue } from './parseFormData.js'

export async function tryOrFail<T = unknown>(
	func: () => Promise<T>,
	/** You can redirect on success */
	redirectTo?: string | URL | ((res: T) => string | URL | undefined)
): Promise<T | ActionFailure<{ message: string } | { issues: Issue[] }>> {
	let result: T | null = null
	let isSuccess = false
	try {
		result = await func()
		isSuccess = true
		return result
	} catch (error: any) {
		// Handle Classic error
		if ('status' in error && 'body' in error && 'message' in error.body) {
			return fail(error.status, { message: error.body.message })
		}

		// Handle Prisma error
		if ('meta' in error && error.meta && 'cause' in error.meta) {
			return fail(400, { message: error.meta.cause })
		}

		// Handle parseFormData error
		if ('issues' in error) {
			return fail(400, { issues: error.issues })
		}

		const { message } = error as Error
		return fail(400, { message })
	} finally {
		if (isSuccess && redirectTo) {
			if (typeof redirectTo === 'string' || redirectTo instanceof URL) redirect(302, redirectTo)
			else if (result) {
				const url = redirectTo(result)
				if (url) redirect(302, url)
				return result
			}
			console.warn('No result can be provide in redirectTo() function. Please use a simple string.')
		}
	}
}
