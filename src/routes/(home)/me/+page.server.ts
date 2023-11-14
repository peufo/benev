import path from 'node:path'
import fs from 'node:fs/promises'
import sharp from 'sharp'
import { z } from 'zod'
import { Blob } from 'node:buffer'
import { fail, error } from '@sveltejs/kit'
import {
	auth,
	getMemberRoles,
	generateToken,
	parseFormData,
	prisma,
	redirectToAuth,
	sendEmailTemplate,
	tryOrFail,
	createAvatarPlaceholder,
} from '$lib/server'
import { loginShema, registerShema } from '$lib/form'
import { EmailVerificationLink, EmailPasswordReset } from '$lib/email'
import { MEDIA_DIR } from '$env/static/private'
import { userUpdateShema } from '$lib/form'

export const load = async ({ url, parent }) => {
	const { user } = await parent()
	if (!user) throw redirectToAuth(url)

	const members = await prisma.member.findMany({
		where: { userId: user.id },
		include: {
			user: true,
			event: true,
			leaderOf: true,
			subscribes: true,
		},
	})
	const membersWithRole = members
		.map((member) => ({
			...member,
			roles: getMemberRoles(member),
		}))
		.filter(({ event, roles }) => event.state !== 'draft' || roles.includes('leader'))

	return {
		user,
		members: membersWithRole,
	}
}

export const actions = {
	register: async ({ request, locals }) => {
		const { err, data } = await parseFormData(request, registerShema)
		if (err) return err

		const attributes = {
			email: data.email,
			firstName: data.firstName,
			lastName: data.lastName,
			phone: data.phone,
			isEmailVerified: false,
			avatarPlaceholder: createAvatarPlaceholder(),
		}
		return tryOrFail(async () => {
			const user = await auth.createUser({
				key: {
					providerId: 'email',
					providerUserId: data.email,
					password: data.password,
				},
				attributes,
			})
			const session = await auth.createSession({ userId: user.userId, attributes: {} })
			locals.auth.setSession(session)

			sendVerificationEmail(session.user, 'Bienvenue')
		})
	},
	login: async ({ request, locals }) => {
		const { err, data } = await parseFormData(request, loginShema)
		if (err) return err
		return tryOrFail(async () => {
			const user = await auth.useKey('email', data.email, data.password)
			const session = await auth.createSession({ userId: user.userId, attributes: {} })
			locals.auth.setSession(session)
		})
	},
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
		const { err, data } = await parseFormData(
			request,
			z.object({ email: z.string().email().toLowerCase() })
		)
		if (err) return err
		return tryOrFail(async () => {
			const user = await prisma.user.findUniqueOrThrow({
				where: { email: data.email },
				select: { id: true },
			})
			const tokenId = await generateToken('passwordReset', user.id)
			await sendEmailTemplate(EmailPasswordReset, {
				to: data.email,
				subject: 'Changement de mot de passe',
				props: { tokenId },
			})
		})
	},
	update_profile: async ({ locals, request }) => {
		const session = await locals.auth.validate()
		if (!session) throw error(401)

		const { err, data } = await parseFormData(request, userUpdateShema)
		if (err) return err

		return tryOrFail(async () => {
			const { userId } = session.user
			const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } })
			const emailUpdated = user.email !== data.email
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
		if (!session) throw error(401)

		return tryOrFail(async () => {
			const avatarPlaceholder = createAvatarPlaceholder()
			return prisma.user.update({
				where: { id: session.user.id },
				data: { avatarPlaceholder },
			})
		})
	},
	remove_avatar: async ({ locals }) => {
		const session = await locals.auth.validate()
		if (!session) throw error(401)

		return tryOrFail(async () => {
			const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } })
			if (!user.avatarId) throw error(404)

			const mediaPath = path.resolve(MEDIA_DIR, user.avatarId)
			await fs.rm(mediaPath, { recursive: true, force: true })
			return prisma.media.delete({ where: { id: user.avatarId } })
		})
	},
	upload_avatar: async ({ request, locals }) => {
		const session = await locals.auth.validate()
		if (!session) throw error(401)

		const { data, err } = await parseFormData(
			request,
			z.object({
				image: z.instanceof(Blob),
				crop: z.object({
					x: z.number(),
					y: z.number(),
					width: z.number(),
					height: z.number(),
				}),
			})
		)
		if (err) return err

		return tryOrFail(async () => {
			const { image, crop } = data

			const imageBuffer = await image.arrayBuffer()

			const sharpStream = sharp(imageBuffer).extract({
				left: crop.x,
				top: crop.y,
				width: crop.width,
				height: crop.height,
			})

			const user = await prisma.user.findUniqueOrThrow({
				where: { id: session.user.id },
				include: { avatar: true },
			})
			const avatar =
				user.avatar ||
				(await prisma.media.create({
					data: {
						name: `Avatar de ${user.firstName}`,
						createdById: user.id,
						avatarOf: { connect: { id: user.id } },
					},
				}))

			const mediaPath = path.resolve(MEDIA_DIR, avatar.id)
			try {
				await fs.access(mediaPath, fs.constants.R_OK)
			} catch {
				await fs.mkdir(mediaPath, { recursive: true })
			}

			const sizes = [256, 512]
			await Promise.all(
				sizes.map((size) => {
					const filePath = path.resolve(mediaPath, `${size}.webp`)
					return sharpStream.clone().resize(size, size).webp().toFile(filePath)
				})
			)

			return
		})
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
	await sendEmailTemplate(EmailVerificationLink, {
		to: user.email,
		subject,
		props: { tokenId },
	})
}