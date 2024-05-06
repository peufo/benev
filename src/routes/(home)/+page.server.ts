import { formAction } from 'fuma/server'
import { error, redirect } from '@sveltejs/kit'
import { prisma, media } from '$lib/server'
import { modelEventCreate } from '$lib/validation'
import { defaultEmailModels } from '$lib/email/models'

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
	create: formAction(
		modelEventCreate,
		async ({ locals, data, formData }) => {
			const session = await locals.auth.validate()
			if (!session) error(401)

			const nameFail = (message: string) => {
				throw { issues: [{ path: ['name'], message }] }
			}

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

			const { userId } = session.user

			const event = await prisma.event.create({
				data: {
					...data,
					ownerId: userId,
					pages: {
						createMany: {
							data: [
								{
									type: 'home',
									title: 'Bienvenue',
									path: 'bienvenue',
									content: 'null',
								},
								...defaultEmailModels,
							],
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
		{
			redirectTo: (event) => `/${event.id}`,
		}
	),
}
