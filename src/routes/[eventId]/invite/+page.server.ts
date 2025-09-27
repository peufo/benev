import { error, redirect } from '@sveltejs/kit'
import { formAction } from 'fuma/server'
import { z } from 'fuma'
import { modelInvite } from '$lib/models'
import {
	prisma,
	sendEmailComponent,
	sendEmailModel,
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
	invite_create: formAction(modelInvite, async ({ data, event }) => {
		const { eventId } = event.params
		const author = await permission.leader(eventId, event.locals)

		const member = await prisma.member.create({
			data: {
				...data,
				eventId,
				isValidedByEvent: true,
				avatarPlaceholder: createAvatarPlaceholder(),
				isNotifiedSubscribe: !!data.email,
				isNotifiedLeaderOfSubscribe: !!data.email,
				isNotifiedAdminOfNewMember: !!data.email,
			},
			include: { event: true },
		})

		if (!member.email) return member

		await sendEmailModel(eventId, 'invitation_create', {
			from: member.event.name,
			to: member.email,
			replyTo: author.email,
			subject: 'Invitation',
			props: {
				authorName: `${author.firstName} ${author.lastName}`,
				member: await getMemberProfile({ id: member.id }),
			},
		})

		return member
	}),

	// TODO: DRAW A FUCKING WORKFLOW
	accept_invite: formAction(
		{
			redirectTo: z.string().optional(),
		},
		async ({ data, event: { params, locals } }) => {
			const { eventId } = params
			const session = await locals.auth.validate()
			if (!session) error(401)

			const isValidedByEvent = await permission
				.leader(eventId, locals)
				.then(() => true)
				.catch(() => false)

			// Si le membre existe déjà, on le link au user
			// TODO: update member contact details from user
			const memberAlreadyExist = await prisma.member.findFirst({
				where: { eventId, email: session.user.email },
			})
			if (memberAlreadyExist) {
				await prisma.member.update({
					where: { id: memberAlreadyExist.id },
					data: {
						userId: session.user.id,
						isValidedByEvent: isValidedByEvent || memberAlreadyExist.isValidedByEvent,
						isValidedByUser: true,
					},
				})
				await ensureLicenceMembers(eventId)
				// TODO: mails to admins ?
				return data
			}

			const { selfRegisterAllowed } = await prisma.event.findUniqueOrThrow({
				where: { id: eventId },
				select: { selfRegisterAllowed: true },
			})
			if (!selfRegisterAllowed) error(403)

			const { id } = await prisma.member.create({
				data: {
					userId: session.user.id,
					eventId,
					isValidedByEvent,
				},
			})
			const member = await getMemberProfile({ id })
			if (!member.email) return data // TODO: impossible ... DRAW A DIAGRAM PLEASE

			const admins = await prisma.member.findMany({
				where: {
					eventId,
					email: { not: null },
					isAdmin: true,
					isNotifiedAdminOfNewMember: true,
				},
			})
			const adminsEmail = admins.map((a) => a.email as string)

			const emailOptions = {
				from: member.event.name,
				subject: 'Invitation acceptée',
				props: { member },
			}

			await Promise.all([
				sendEmailModel(eventId, 'invitation_accept', {
					...emailOptions,
					to: member.email,
					replyTo: adminsEmail,
				}),
				!!adminsEmail.length &&
					sendEmailComponent(EmailAcceptInviteNotification, {
						...emailOptions,
						to: adminsEmail,
						replyTo: member.email,
					}),
			])

			return data
		},
		{
			redirectTo: (data) => data?.redirectTo,
		}
	),
}
