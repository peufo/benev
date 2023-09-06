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
	throw redirect(301, `/${params.eventId}/me/profile`)
}

export const actions = {
	new_invite: async ({ request, locals, params }) => {
		const session = await isLeaderInEventOrThrow(params.eventId, locals)

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

			const newMember = await prisma.member.create({
				data: {
					userId: user.id,
					eventId: params.eventId,
					isValidedByEvent: true,
				},
				include: {
					user: true,
					event: true,
				},
			})

			const tokenId = await generateToken(
				'passwordReset',
				user.id,
				new Date().getTime() + 1000 * 60 * 60 * 24 * 7
			)
			await sendEmailTemplate(EmailNewInvite, {
				to: data.email,
				subject: 'Changement de mot de passe',
				props: {
					tokenId,
					member: newMember,
					authorName: `${session.user.firstName} ${session.user.lastName}`,
				},
			})
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
							memberFields: true,
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
