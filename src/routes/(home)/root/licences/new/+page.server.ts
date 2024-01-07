import { permission } from '$lib/server/permission.js'

export const actions = {
	default: async ({ locals }) => {
		await permission.root(locals)

		console.log('TODO: NEW LICENCE')
	},
}
