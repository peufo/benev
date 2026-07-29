import { error, invalid, redirect } from '@sveltejs/kit'
import { form, getRequestEvent } from '$app/server'
import z from 'zod'
import {
	auth,
	createAvatarPlaceholder,
	generateToken,
	media,
	prisma,
	sendEmailComponent,
} from '$lib/server'
import { modelUserCreate, modelUserLogin, modelUserUpdate } from '$lib/models'
import { modelMediaImage } from '$lib/models/media'
import { EmailPasswordReset, EmailVerificationLink } from '$lib/email'

export const registerUser = form(z.object(modelUserCreate), async (data) => {
	const { locals } = getRequestEvent()
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
})

export const loginUser = form(z.object(modelUserLogin), async ({ email, password }) => {
	const { locals } = getRequestEvent()
	// Lucia distingue clé inconnue et mot de passe faux; l'exposer permettrait d'énumérer les
	// comptes. Sans ce `catch`, l'erreur remonte en 500 « Internal Error » côté client.
	const user = await auth.useKey('email', email, password).catch(() => {
		error(401, 'Invalid credentials')
	})
	const session = await auth.createSession({ userId: user.userId, attributes: {} })
	locals.auth.setSession(session)
})

export const logoutUser = form(async () => {
	const { locals } = getRequestEvent()
	const session = await locals.auth.validate()
	if (!session) error(401)
	await auth.invalidateSession(session.sessionId)
	locals.auth.setSession(null) // remove cookie
})

export const sendEmailVerification = form(async () => {
	const { locals } = getRequestEvent()
	const session = await locals.auth.validate()
	if (!session) error(401)
	await sendVerificationEmail(session.user)
})

export const resetPassword = form(
	z.object({ email: z.string().email().toLowerCase() }),
	async ({ email }) => {
		// Adresse inconnue: on ne le dit pas et on ne lève pas non plus. Répondre différemment
		// selon l'existence du compte permettrait d'énumérer les utilisateurs — et `findUniqueOrThrow`
		// remontait en 500 chez la personne qui s'est simplement trompée d'adresse.
		const user = await prisma.user.findUnique({ where: { email }, select: { id: true } })
		if (!user) return

		const tokenId = await generateToken('passwordReset', user.id)
		await sendEmailComponent(EmailPasswordReset, {
			to: email,
			subject: 'Reinitialisation du mot de passe',
			props: { tokenId },
		})
	}
)

/**
 * Les champs requis dépendent de l'évènement d'où l'on vient (`eventId`): cette part de la
 * validation ne peut pas vivre dans le schéma, elle est rejouée ici via `invalid()`.
 */
export const updateAccount = form(
	z.object({ ...modelUserUpdate, eventId: z.string().optional() }),
	async ({ eventId, ...data }, issue) => {
		const { locals } = getRequestEvent()
		const session = await locals.auth.validate()
		if (!session) error(401)

		const { userId } = session.user
		const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } })
		const event = eventId ? await prisma.event.findUnique({ where: { id: eventId } }) : null

		if (event) {
			const issues = []
			if (event.userBirthdayRequired && !data.birthday)
				issues.push(issue.birthday('Birthday is required'))
			if (event.userPhoneRequired && !data.phone) issues.push(issue.phone('Phone is required'))
			if (event.userAddressRequired) {
				if (!data.city) issues.push(issue.city('Address is required'))
				if (!data.street) issues.push(issue.street('Address is required'))
				if (!data.zipCode) issues.push(issue.zipCode('Address is required'))
			}
			if (issues.length) invalid(...issues)
		}

		const isEmailUpdated = data.email && user.email !== data.email
		const userUpdated = await prisma.user.update({
			where: { id: userId },
			data: {
				...data,
				...(isEmailUpdated ? { isEmailVerified: false } : {}),
			},
		})

		if (isEmailUpdated) {
			sendVerificationEmail(userUpdated)
			await prisma.key.updateMany({
				where: { id: `email:${user.email}` },
				data: { id: `email:${userUpdated.email}` },
			})
		}
		return userUpdated
	}
)

export const generateAvatar = form(async () => {
	const { locals } = getRequestEvent()
	const session = await locals.auth.validate()
	if (!session) error(401)

	return prisma.user.update({
		where: { id: session.user.id },
		data: { avatarPlaceholder: createAvatarPlaceholder() },
	})
})

export const deleteAvatar = form(async () => {
	const { locals } = getRequestEvent()
	const session = await locals.auth.validate()
	if (!session) error(401)
	const { user } = session

	await media.delete({ avatarOf: { id: user.id } })
	await prisma.member.updateMany({ where: { userId: user.id }, data: { avatarId: null } })
})

export const uploadAvatar = form(z.object(modelMediaImage), async (image) => {
	const { locals } = getRequestEvent()
	const session = await locals.auth.validate()
	if (!session) error(401)
	const { user } = session

	const avatar = await media.upload(image, {
		where: { avatarOf: { id: user.id } },
		data: {
			name: `Avatar de ${user.firstName} ${user.lastName}`,
			createdById: user.id,
			avatarOf: { connect: { id: user.id } },
		},
	})
	await prisma.member.updateMany({ where: { userId: user.id }, data: { avatarId: avatar.id } })
	return avatar
})

export const deleteUser = form(async () => {
	const { locals } = getRequestEvent()
	const session = await locals.auth.validate()
	if (!session) error(401)
	await auth.deleteUser(session.user.id)
	locals.auth.setSession(null)
	redirect(303, '/')
})

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
