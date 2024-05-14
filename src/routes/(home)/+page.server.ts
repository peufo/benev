import { formAction } from 'fuma/server'
import { error, redirect } from '@sveltejs/kit'
import { z } from 'fuma'
import type { Event } from '@prisma/client'
import { prisma, media, permission } from '$lib/server'
import { modelEventCreate, modelEventUpdate } from '$lib/models'
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
	event_create: formAction(
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

			await uploadImages(formData, event.id, session.user.id)

			return event
		},
		{
			redirectTo: (event) => `/${event.id}`,
		}
	),
	event_update: formAction(modelEventUpdate, async ({ locals, data, formData }) => {
		const member = await permission.admin(data.id, locals)

		await uploadImages(formData, data.id, member.user.id)

		return prisma.event.update({
			where: { id: data.id },
			data,
		})
	}),

	event_delete: formAction(
		{ id: z.string() },
		async ({ data, locals }) => {
			await permission.admin(data.id, locals)
			await prisma.event.delete({
				where: { id: data.id },
			})
		},
		{ redirectTo: '/me' }
	),
}

async function uploadImages(formData: FormData, eventId: string, authorId: string) {
	await media.upload(formData, {
		key: 'poster',
		where: { posterOf: { id: eventId } },
		data: {
			name: 'Affiche',
			createdById: authorId,
			posterOf: { connect: { id: eventId } },
		},
	})

	await media.upload(formData, {
		key: 'logo',
		where: { logoOf: { id: eventId } },
		data: {
			name: 'Logo',
			createdById: authorId,
			logoOf: { connect: { id: eventId } },
		},
	})
}
