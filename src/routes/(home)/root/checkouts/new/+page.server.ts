import { tryOrFail, parseFormData } from 'fuma/server'
import { permission, prisma } from '$lib/server'
import { modelCheckout } from '$lib/models'
import type { Prisma } from '@prisma/client'

export const actions = {
	default: async ({ locals, request }) => {
		await permission.root(locals)

		return tryOrFail(async () => {
			const { data } = await parseFormData(request, modelCheckout)

			const licencesArray = Array.isArray(data.licences.create)
				? data.licences.create
				: [data.licences.create]
			const licences = licencesArray
				.map(({ type, ownerId, quantity }) =>
					Array<Prisma.LicenceUncheckedCreateWithoutCheckoutInput>(quantity).fill({ type, ownerId })
				)
				.flat()
			return prisma.checkout.create({
				data: { ...data, licences: { create: licences } },
			})
		}, '/root/checkouts')
	},
}
