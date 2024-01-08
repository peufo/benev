import { permission, parseFormData, tryOrFail, prisma } from '$lib/server'
import { checkoutCreate } from '$lib/validation'

export const actions = {
	default: async ({ locals, request }) => {
		await permission.root(locals)
		const { data, err } = await parseFormData(request, checkoutCreate)
		if (err) return err
		return tryOrFail(() => prisma.checkout.create({ data }), '/root/checkouts')
	},
}
