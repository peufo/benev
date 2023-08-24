import { error, fail, redirect } from '@sveltejs/kit'
import { parseFormData, tryOrFail } from '$lib/server'
import { eventShema } from '$lib/form'
import { prisma } from '$lib/server'

export const load = async () => {
	const events = await prisma.event.findMany()
	return { events }
}

export const actions = {
	new_event: async ({ request, locals }) => {
		const session = await locals.auth.validate()
		if (!session) throw error(401)

		const { err, data } = await parseFormData(request, eventShema)
		if (err) return err

		const nameFail = (message: string) => fail(400, { issues: [{ path: ['name'], message }] })

		const exist = await prisma.event.findUnique({ where: { id: data.id } })
		if (exist) return nameFail('Désolé, ce nom est déjà pris')

		const reservedPaths = ['auth', 'me', 'users', 'members', 'root', 'admin', 'token', 'api']
		if (reservedPaths.includes(data.id))
			return nameFail(`Les noms suivant sont réservés: ${reservedPaths.join(', ')}`)

		return tryOrFail(
			async () => {
				const { userId } = session.user
				return await prisma.event.create({
					data: {
						...data,
						ownerId: userId,
						pages: {
							create: {
								isIndex: true,
								title: 'Bienvenue',
								path: 'bienvenue',
								content: 'null',
							},
						},
						members: {
							create: {
								userId,
								isValidedByEvent: true,
								isValidedByUser: true,
							},
						},
					},
				})
			},
			(res) => `/${res.id}`
		)
	},
}
