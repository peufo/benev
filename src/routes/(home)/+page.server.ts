import { prisma } from '$lib/server'
import { error, fail, redirect } from '@sveltejs/kit'
import { media, parseFormData, tryOrFail } from '$lib/server'
import { eventCreate } from '$lib/validation'

export const load = async ({ url }) => {
	const prospectId = url.searchParams.get('prospectId')
	if (prospectId) {
		await prisma.prospect
			.update({ where: { id: prospectId }, data: { linkOpenAt: new Date() } })
			.catch(() => {})
		redirect(302, '/')
	}
}

export const actions = {
	new_event: async ({ request, locals }) => {
		const session = await locals.auth.validate()
		if (!session) error(401)

		const { err, data, formData } = await parseFormData(request, eventCreate)
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
			'events',
			'pricing',
			'contact',
			'licences',
		]
		if (reservedPaths.includes(data.id))
			return nameFail(`Les noms suivant sont réservés: ${reservedPaths.join(', ')}`)
		if (data.id.startsWith('deleted_'))
			return nameFail('Les noms ne peuvent pas commencer par "deleted_"')
		if (data.id.startsWith('archived_'))
			return nameFail('Les noms ne peuvent pas commencer par "archived_"')

		return tryOrFail(
			async () => {
				const { userId } = session.user

				const event = await prisma.event.create({
					data: {
						...data,
						ownerId: userId,
						pages: {
							create: {
								type: 'home',
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

				await media
					.upload(formData, {
						key: 'poster',
						where: { posterOf: { id: event.id } },
						data: {
							name: `Affiche de ${event.name}`,
							createdById: session.user.id,
							posterOf: { connect: { id: event.id } },
						},
					})
					.catch(console.error)

				await media
					.upload(formData, {
						key: 'logo',
						where: { logoOf: { id: event.id } },
						data: {
							name: `Logo de ${event.name}`,
							createdById: session.user.id,
							logoOf: { connect: { id: event.id } },
						},
					})
					.catch(console.error)

				return event
			},
			(res) => `/${res.id}`
		)
	},
}
