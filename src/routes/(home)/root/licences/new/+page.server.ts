import { permission, parseFormData, tryOrFail, prisma } from '$lib/server'
import { licenceCreate } from '$lib/validation'

export const actions = {
	default: async ({ locals, request }) => {
		await permission.root(locals)
		const { data, err } = await parseFormData(request, licenceCreate)
		if (err) return err

		console.log(data)

		/*
		prisma.checkout.create({
			data: {
				amount: 3,
				user: { connect: { id: ''}},
				licences: { }
			}
		})

		return tryOrFail(() => prisma.licence.create({ data }), '/root/licences')
		*/
	},
}
