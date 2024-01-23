import { permission, parseFormData, tryOrFail, prisma } from '$lib/server'
import { checkoutCreate } from '$lib/validation'
import type { Prisma } from '@prisma/client'

export const actions = {
	default: async ({ locals, request }) => {
		await permission.root(locals)

		const { data, err } = await parseFormData(request, checkoutCreate)
		if (err) return err

		const licencesArray = Array.isArray(data.licences.create)
			? data.licences.create
			: [data.licences.create]
		const licences = licencesArray
			.map(({ type, ownerId, quantity }) =>
				Array<Prisma.LicenceUncheckedCreateWithoutCheckoutInput>(quantity).fill({ type, ownerId })
			)
			.flat()

		return tryOrFail(
			() =>
				prisma.checkout.create({
					data: { ...data, licences: { create: licences } },
				}),
			'/root/checkouts'
		)
	},
}
