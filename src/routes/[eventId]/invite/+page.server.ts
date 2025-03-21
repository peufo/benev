import { error, redirect } from '@sveltejs/kit'
import { parseFormData, tryOrFail } from 'fuma/server'
import { z } from 'fuma'
import { modelInvite } from '$lib/models'
import {
	prisma,
	sendEmailComponent,
	sendEmailModel,
	auth,
	generateToken,
	permission,
	createAvatarPlaceholder,
	ensureLicenceMembers,
	getMemberProfile,
	generateEmail,
} from '$lib/server'
import { EmailAcceptInviteNotification } from '$lib/email'

export const load = async ({ params }) => {
	redirect(301, `/${params.eventId}/me`)
}

export const actions = {
	invite_create: async ({ request, locals, params: { eventId } }) => {
		const { user: author } = await permission.leader(eventId, locals)

		return tryOrFail(async () => {
			const { data } = await parseFormData(request, modelInvite)

			const email = data.email || (await generateEmail())
			let user = !data.email
				? null
				: await prisma.user.findUnique({
						where: { email: data.email },
						select: { id: true, email: true },
				  })
			const isNewUser = !user
			if (!user) {
				user = await auth.createUser({
					key: {
						providerId: 'email',
						providerUserId: email,
						password: null,
					},
					attributes: {
						...data,
						email,
						isHeadlessAccount: !data.email,
						isEmailVerified: !data.email,
						avatarPlaceholder: createAvatarPlaceholder(),
					},
				})
			}

			if (
				await prisma.member.findFirst({
					where: { userId: user.id, eventId },
				})
			)
				throw new Error('Member already exists')

			const { id } = await prisma.member.create({
				data: {
					userId: user.id,
					eventId,
					isValidedByEvent: true,
					isNotifiedSubscribe: !!data.email,
					isNotifiedLeaderOfSubscribe: !!data.email,
					isNotifiedAdminOfNewMember: !!data.email,
				},
			})
			const member = await getMemberProfile({ id })

			if (member.user.isHeadlessAccount) return member

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

		return tryOrFail(
			async () => {
				const { data } = await parseFormData(request, {
					userId: z.string(),
					redirectTo: z.string().optional(),
				})

				const { userId } = data

				const isValidedByUser = session.user.id === userId
				const isValidedByEvent = await permission
					.leader(eventId, locals)
					.then(() => true)
					.catch(() => false)

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
					where: {
						eventId,
						isAdmin: true,
						isValidedByUser: true,
						isNotifiedAdminOfNewMember: true,
					},
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
					!!adminsEmail.length &&
						sendEmailComponent(EmailAcceptInviteNotification, {
							...emailOptions,
							to: adminsEmail,
							replyTo: member.user.email,
						}),
				])

				return data
			},
			(data) => data?.redirectTo
		)
	},
}
