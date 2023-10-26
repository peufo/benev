import { error, redirect } from '@sveltejs/kit'
import { z } from 'zod'
import { memberShema } from '$lib/form'
import {
	parseFormData,
	prisma,
	tryOrFail,
	sendEmailTemplate,
	isLeaderInEventOrThrow,
	auth,
	isLeaderInEvent,
	generateToken,
} from '$lib/server'
import { EmailAcceptInvite, EmailAcceptInviteNotification, EmailNewInvite } from '$lib/email'

export const load = async ({ params }) => {
	throw redirect(301, `/me/${params.eventId}`)
}

export const actions = {
	new_invite: async ({ request, locals, params: { eventId } }) => {
		const session = await isLeaderInEventOrThrow(eventId, locals)

		const { err, data } = await parseFormData(
			request,
			z.object({
				email: z.string().email().toLowerCase(),
				firstName: z.string().min(2),
				lastName: z.string().min(2),
			})
		)
		if (err) return err

		return tryOrFail(async () => {
			let user = await prisma.user.findUnique({
				where: { email: data.email },
				select: { id: true, email: true },
			})
			let isNewUser = !user
			if (!user) {
				user = await auth.createUser({
					key: {
						providerId: 'email',
						providerUserId: data.email,
						password: null,
					},
					attributes: { ...data, isEmailVerified: false },
				})
			}
			const userId = user.id

			const member = await prisma.member.findFirst({
				where: { userId, eventId },
			})
			if (member) throw new Error('Member already exists')

			const newMember = await prisma.member.create({
				data: {
					userId,
					eventId,
					isValidedByEvent: true,
				},
				include: {
					user: true,
					event: true,
				},
			})

			const tokenId = isNewUser
				? await generateToken(
						'passwordReset',
						user.id,
						new Date().getTime() + 1000 * 60 * 60 * 24 * 7
				  )
				: undefined
			await sendEmailTemplate(EmailNewInvite, {
				to: data.email,
				subject: `${newMember.event.name} - Invitation`,
				props: {
					tokenId,
					member: newMember,
					authorName: `${session.user.firstName} ${session.user.lastName}`,
				},
			})
			return newMember
		})
	},

	accept_invite: async ({ request, locals, params: { eventId } }) => {
		const session = await locals.auth.validate()
		if (!session) throw error(401)

		const { err, data } = await parseFormData(request, memberShema)
		if (err) return err

		const { userId } = data

		const isValidedByUser = session.user.id === userId
		const isValidedByEvent = !!(await isLeaderInEvent(eventId, locals))

		return tryOrFail(async () => {
			// Si le membre existe déjà, on met juste à jour ca validation
			const member = await prisma.member.findUnique({
				where: { userId_eventId: { userId, eventId } },
			})
			if (member) {
				await prisma.member.update({
					where: { id: member.id },
					data: {
						isValidedByUser,
						isValidedByEvent,
					},
				})
				return
			}

			const newMember = await prisma.member.create({
				data: {
					userId,
					eventId,
					isValidedByUser,
					isValidedByEvent,
				},
				include: {
					user: true,
					event: {
						include: {
							owner: true,
							memberFields: { orderBy: { position: 'asc' } },
						},
					},
				},
			})

			await Promise.all([
				sendEmailTemplate(EmailAcceptInvite, {
					from: newMember.event.name,
					to: newMember.user.email,
					subject: `${newMember.event.name} - Nouveau membre`,
					props: { member: newMember },
				}),
				sendEmailTemplate(EmailAcceptInviteNotification, {
					from: newMember.event.name,
					to: newMember.event.owner.email,
					subject: `${newMember.event.name} - Nouveau membre`,
					props: { member: newMember },
				}),
			])
		})
	},
}
