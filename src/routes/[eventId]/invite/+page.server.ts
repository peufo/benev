import { error, redirect } from '@sveltejs/kit'
import { z } from '$lib/validation'
import {
	parseFormData,
	prisma,
	tryOrFail,
	sendEmailTemplate,
	auth,
	generateToken,
	permission,
	createAvatarPlaceholder,
	ensureLicenceMembers,
} from '$lib/server'
import { EmailAcceptInvite, EmailAcceptInviteNotification, EmailNewInvite } from '$lib/email'

export const load = async ({ params }) => {
	redirect(301, `/${params.eventId}/me`);
}

export const actions = {
	new_invite: async ({ request, locals, params: { eventId } }) => {
		const { user: author } = await permission.leader(eventId, locals)

		const { err, data } = await parseFormData(request, {
			email: z.string().email().toLowerCase(),
			firstName: z.string().min(2),
			lastName: z.string().min(2),
		})
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
					attributes: {
						...data,
						isEmailVerified: false,
						avatarPlaceholder: createAvatarPlaceholder(),
					},
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
				replyTo: author.email,
				subject: `${newMember.event.name} - Invitation`,
				props: {
					tokenId,
					member: newMember,
					authorName: `${author.firstName} ${author.lastName}`,
				},
			})
			return newMember
		})
	},

	accept_invite: async ({ request, locals, params: { eventId } }) => {
		const session = await locals.auth.validate()
		if (!session) error(401);

		const { err, data } = await parseFormData(request, {
			userId: z.string(),
			redirectTo: z.string().optional(),
		})
		if (err) return err

		const { userId } = data

		const isValidedByUser = session.user.id === userId
		const isValidedByEvent = await permission
			.leader(eventId, locals)
			.then(() => true)
			.catch(() => false)

		return tryOrFail(async () => {
			// Si le membre existe déjà, on met juste à jour sa validation
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
				await ensureLicenceMembers(eventId)
				// TODO: mails to admins ?
				return
			}

			const { selfRegisterAllowed } = await prisma.event.findUniqueOrThrow({
				where: { id: eventId },
				select: { selfRegisterAllowed: true },
			})
			if (!selfRegisterAllowed) error(403);

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
							memberFields: { orderBy: { position: 'asc' } },
						},
					},
				},
			})

			const admins = await prisma.member.findMany({
				where: { eventId, isAdmin: true },
				select: { user: { select: { email: true } } },
			})
			const adminsEmail = admins.map((a) => a.user.email)

			await Promise.all([
				sendEmailTemplate(EmailAcceptInvite, {
					from: newMember.event.name,
					to: newMember.user.email,
					replyTo: adminsEmail,
					subject: `${newMember.event.name} - Nouveau membre`,
					props: { member: newMember },
				}),
				sendEmailTemplate(EmailAcceptInviteNotification, {
					from: newMember.event.name,
					to: adminsEmail,
					replyTo: newMember.user.email,
					subject: `${newMember.event.name} - Nouveau membre`,
					props: { member: newMember },
				}),
			])
		}, data.redirectTo)
	},
}
