import { error, fail, redirect } from '@sveltejs/kit'
import { parseFormData } from '$lib/server'
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

		const exist = await prisma.event.findUnique({ where: { id: data.id } })
		if (exist)
			return fail(400, { issues: [{ path: ['name'], message: 'Désolé, ce nom est déjà pris' }] })

		const reservedPaths = ['auth', 'me', 'users', 'root', 'admin', 'token']
		if (reservedPaths.includes(data.id))
			return fail(400, { message: `Les noms suivant sont réservés: ${reservedPaths.join(', ')}` })

		const event = await prisma.event.create({
			data: {
				...data,
				ownerId: session.user.userId,
				pages: {
					create: {
						isIndex: true,
						title: 'Bienvenue',
						path: 'bienvenue',
						content: 'null',
					},
				},
			},
		})

		throw redirect(301, `/${event.id}`)
	},
}
