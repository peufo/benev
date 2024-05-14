import { fail, error, redirect } from '@sveltejs/kit'
import { tryOrFail, parseFormData, formAction } from 'fuma/server'
import { z } from 'fuma/validation'
import {
	auth,
	generateToken,
	prisma,
	sendEmailComponent,
	createAvatarPlaceholder,
	media,
} from '$lib/server'
import { modelUserLogin, modelUserCreate, modelUserUpdate } from '$lib/models'
import { EmailVerificationLink, EmailPasswordReset } from '$lib/email'

export const load = () => {
	redirect(302, '/me/events')
}

export const actions = {
	register: formAction(modelUserCreate, async ({ locals, data }) => {
		const attributes = {
			email: data.email,
			firstName: data.firstName,
			lastName: data.lastName,
			isTermsAccepted: data.isTermsAccepted,
			isOrganizer: data.isOrganizer,
			isEmailVerified: false,
			avatarPlaceholder: createAvatarPlaceholder(),
		}

		const user = await prisma.user.findUnique({
			where: { email: data.email },
			include: { members: { select: { isValidedByUser: true } } },
		})
		if (user) {
			const isAccountFromInvitation =
				user.members.filter((m) => m.isValidedByUser === false).length > 0 &&
				user.members.filter((m) => m.isValidedByUser === true).length === 0
			if (isAccountFromInvitation) error(401, 'This account already created from an invitation')
			error(401, 'This account already exists')
		}
		const newUser = await auth.createUser({
			key: {
				providerId: 'email',
				providerUserId: data.email,
				password: data.password,
			},
			attributes,
		})
		const session = await auth.createSession({ userId: newUser.userId, attributes: {} })
		locals.auth.setSession(session)

		await sendVerificationEmail(session.user, 'Bienvenue')
	}),
	login: formAction(modelUserLogin, async ({ locals, data }) => {
		const user = await auth.useKey('email', data.email, data.password)
		const session = await auth.createSession({ userId: user.userId, attributes: {} })
		locals.auth.setSession(session)
	}),
	logout: async ({ locals }) => {
		const session = await locals.auth.validate()
		if (!session) return fail(401)
		await auth.invalidateSession(session.sessionId)
		locals.auth.setSession(null) // remove cookie
	},
	verify_email: async ({ locals }) => {
		const session = await locals.auth.validate()
		if (!session) return fail(401)
		await sendVerificationEmail(session.user)
	},
	reset_password: async ({ request }) => {
		return tryOrFail(async () => {
			const { data } = await parseFormData(request, { email: z.string().email().toLowerCase() })
			const user = await prisma.user.findUniqueOrThrow({
				where: { email: data.email },
				select: { id: true },
			})
			const tokenId = await generateToken('passwordReset', user.id)
			await sendEmailComponent(EmailPasswordReset, {
				to: data.email,
				subject: 'Reinitialisation du mot de passe',
				props: { tokenId },
			})
		})
	},
	update_account: async ({ locals, request }) => {
		const session = await locals.auth.validate()
		if (!session) error(401)

		// Adapte validation model with event context
		const formData = await request.formData()
		const eventId = formData.get('eventId') as string | null
		const event = await prisma.event.findUnique({ where: { id: eventId || '' } })

		return tryOrFail(async () => {
			const { userId } = session.user
			const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } })

			const { data } = await parseFormData(formData, modelUserUpdate, (value, ctx) => {
				if (!event) return
				const addIssue = (path: string, message: string) =>
					ctx.addIssue({ code: 'custom', path: [path], message })

				if (event.userBirthdayRequired && !value.birthday)
					addIssue('birthday', 'Birthday is required')
				if (event.userPhoneRequired && !value.phone) addIssue('phone', 'Phone is required')
				if (event.userAddressRequired) {
					if (!value.city) addIssue('city', 'Address is required')
					if (!value.street) addIssue('street', 'Address is required')
					if (!value.zipCode) addIssue('zipCode', 'Address is required')
				}
			})

			const emailUpdated = data.email && user.email !== data.email
			if (emailUpdated) sendVerificationEmail(user)
			return prisma.user.update({
				where: { id: session.user.userId },
				data: {
					...data,
					...(emailUpdated ? { isEmailVerified: false } : {}),
				},
			})
		})
	},
	generate_avatar: async ({ locals }) => {
		const session = await locals.auth.validate()
		if (!session) error(401)

		return tryOrFail(async () => {
			const avatarPlaceholder = createAvatarPlaceholder()
			return prisma.user.update({
				where: { id: session.user.id },
				data: { avatarPlaceholder },
			})
		})
	},
	delete_avatar: async ({ locals }) => {
		const session = await locals.auth.validate()
		if (!session) error(401)
		return tryOrFail(() => media.delete({ avatarOf: { id: session.user.id } }))
	},
	upload_avatar: async ({ request, locals }) => {
		const session = await locals.auth.validate()
		if (!session) error(401)

		return tryOrFail(() =>
			media.upload(request, {
				where: { avatarOf: { id: session.user.id } },
				data: {
					name: `Avatar de ${session.user.firstName} ${session.user.lastName}`,
					createdById: session.user.id,
					avatarOf: { connect: { id: session.user.id } },
				},
			})
		)
	},

	delete_user: async ({ locals }) => {
		const session = await locals.auth.validate()
		if (!session) return fail(401)
		return tryOrFail(async () => {
			await auth.deleteUser(session.user.id)
			locals.auth.setSession(null)
		}, '/')
	},
}

async function sendVerificationEmail(
	user: { id: string; email: string },
	subject = 'Verification de ton Email'
) {
	const tokenId = await generateToken('emailVerification', user.id)
	await sendEmailComponent(EmailVerificationLink, {
		to: user.email,
		subject,
		props: { tokenId },
	})
}
