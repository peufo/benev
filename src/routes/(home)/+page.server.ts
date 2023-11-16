import { prisma } from '$lib/server'
import { error, fail } from '@sveltejs/kit'
import { media, parseFormData, tryOrFail } from '$lib/server'
import { eventShemaCreate } from '$lib/validation'
import { FORMAT_A3 } from '$lib/constants'

export const load = async () => {
	const events = await prisma.event.findMany({ where: { state: 'active' } })
	return { events }
}

export const actions = {
	new_event: async ({ request, locals }) => {
		const session = await locals.auth.validate()
		if (!session) throw error(401)

		const { err, data, formData } = await parseFormData(request, eventShemaCreate)
		if (err) return err

		const nameFail = (message: string) => fail(400, { issues: [{ path: ['name'], message }] })
		const exist = await prisma.event.findUnique({ where: { id: data.id } })
		if (exist) return nameFail('Désolé, ce nom est déjà pris')

		const reservedPaths = [
			'auth',
			'me',
			'users',
			'members',
			'root',
			'admin',
			'token',
			'api',
			'media',
			'help',
			'terms',
		]
		if (reservedPaths.includes(data.id))
			return nameFail(`Les noms suivant sont réservés: ${reservedPaths.join(', ')}`)

		return tryOrFail(
			async () => {
				const { userId } = session.user

				const event = await prisma.event.create({
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
								isAdmin: true,
								isValidedByEvent: true,
								isValidedByUser: true,
							},
						},
					},
				})

				await media.upload(formData, {
					key: 'poster',
					where: { posterOf: { id: event.id } },
					data: {
						name: `Affiche de ${event.name}`,
						createdById: session.user.id,
						posterOf: { connect: { id: event.id } },
					},
					sizes: [
						[FORMAT_A3.x, FORMAT_A3.y],
						[FORMAT_A3.x * 2, FORMAT_A3.y * 2],
					],
				})

				return event
			},
			(res) => `/${res.id}`
		)
	},
}
