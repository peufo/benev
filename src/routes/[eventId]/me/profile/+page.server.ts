import { error, redirect } from '@sveltejs/kit'
import { parseFormData, prisma, tryOrFail } from '$lib/server'
import { userShema } from '$lib/form'

export const load = async ({ locals }) => {
	const session = await locals.auth.validate()
	if (!session) throw redirect(300, '/me')
	return {
		user: await prisma.user.findFirstOrThrow({
			where: { id: session.user.userId },
		}),
	}
}

export const actions = {
	/** Update member profile */
	default: async ({ locals, request, params: { eventId } }) => {
		const session = await locals.auth.validate()
		if (!session) throw error(401)
		return tryOrFail(async () => {
			const formData = Object.fromEntries(await request.formData())
			const data: Record<string, string> = Object.entries(formData)
				.filter(([key]) => !key.startsWith('ignored_'))
				.reduce(
					(acc, [key, value]) => ({
						...acc,
						[key.replace(/(number_)|(boolean)_/, '')]: value,
					}),
					{}
				)

			console.log(data)

			const fields = await prisma.field.findMany({
				where: { eventId, name: { in: Object.keys(data) } },
			})

			const member = await prisma.member.findUniqueOrThrow({
				where: { userId_eventId: { eventId, userId: session.user.id } },
			})

			await prisma.member.update({
				where: { id: member.id },
				data: {
					profile: {
						upsert: fields.map(({ name, id }) => ({
							where: { fieldId_memberId: { fieldId: id, memberId: member.id } },
							create: { value: data[name], fieldId: id },
							update: { value: data[name] },
						})),
					},
				},
			})
		})
	},
}
