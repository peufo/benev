import { error, redirect } from '@sveltejs/kit'
import { z } from '$lib/validation'
import {
	parseFormData,
	prisma,
	tryOrFail,
	sendEmailComponent,
	sendEmailModel,
	auth,
	generateToken,
	permission,
	createAvatarPlaceholder,
	ensureLicenceMembers,
	getMemberProfile,
} from '$lib/server'
import { EmailAcceptInviteNotification } from '$lib/email'

export const load = async ({ params }) => {
	redirect(301, `/${params.eventId}/me`)
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

			if (
				await prisma.member.findFirst({
					where: { userId, eventId },
				})
			)
				throw new Error('Member already exists')

			const { id } = await prisma.member.create({
				data: {
					userId,
					eventId,
					isValidedByEvent: true,
				},
			})
			const member = await getMemberProfile({ id })

			const tokenId = isNewUser
				? await generateToken(
						'passwordReset',
						user.id,
						new Date().getTime() + 1000 * 60 * 60 * 24 * 7
				  )
				: undefined

			await sendEmailModel(eventId, 'invitation_create', {
				from: member.event.name,
				to: data.email,
				replyTo: author.email,
				subject: 'Invitation',
				props: {
					tokenId,
					authorName: `${author.firstName} ${author.lastName}`,
					member,
				},
			})

			return member
		})
	},

	accept_invite: async ({ request, locals, params: { eventId } }) => {
		const session = await locals.auth.validate()
		if (!session) error(401)

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

			const memberAlreadyExist = await prisma.member.findFirst({ where: { eventId, userId } })
			if (memberAlreadyExist) {
				await prisma.member.update({
					where: { id: memberAlreadyExist.id },
					data: {
						isValidedByUser,
						isValidedByEvent: isValidedByEvent || memberAlreadyExist.isValidedByEvent,
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
			if (!selfRegisterAllowed) error(403)

			const { id } = await prisma.member.create({
				data: {
					userId,
					eventId,
					isValidedByUser,
					isValidedByEvent,
				},
			})
			const member = await getMemberProfile({ id })

			const admins = await prisma.member.findMany({
				where: { eventId, isAdmin: true },
				select: { user: { select: { email: true } } },
			})
			const adminsEmail = admins.map((a) => a.user.email)

			const emailOptions = {
				from: member.event.name,
				subject: 'Invitation acceptée',
				props: { member },
			}

			await Promise.all([
				sendEmailModel(eventId, 'invitation_accept', {
					...emailOptions,
					to: member.user.email,
					replyTo: adminsEmail,
				}),
				sendEmailComponent(EmailAcceptInviteNotification, {
					...emailOptions,
					to: adminsEmail,
					replyTo: member.user.email,
				}),
			])
		}, data.redirectTo)
	},
}
