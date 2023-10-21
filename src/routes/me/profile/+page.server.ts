import { Blob } from 'node:buffer'
import path from 'node:path'
import fs from 'node:fs/promises'
import { error } from '@sveltejs/kit'
import { z } from 'zod'
import sharp from 'sharp'
import { MEDIA_DIR } from '$env/static/private'
import { getUserIdOrRedirect, parseFormData, prisma, tryOrFail } from '$lib/server'
import { userShema } from '$lib/form'

export const load = async ({ url, locals }) => {
	const userId = await getUserIdOrRedirect(url, locals)

	return {
		user: await prisma.user.findUniqueOrThrow({
			where: { id: userId },
			include: {
				members: {
					include: {
						event: {
							include: {
								memberFields: {
									orderBy: { position: 'asc' },
									where: { memberCanRead: true },
								},
							},
						},
						profile: {
							where: {
								field: { memberCanRead: true },
							},
						},
					},
				},
			},
		}),
	}
}

export const actions = {
	update_profile: async ({ locals, request }) => {
		const session = await locals.auth.validate()
		if (!session) throw error(401)

		const { err, data } = await parseFormData(request, userShema)
		if (err) return err
		return tryOrFail(() =>
			prisma.user.update({
				where: { id: session.user.userId },
				data,
			})
		)
	},
	generate_avatar: async ({ locals }) => {
		const session = await locals.auth.validate()
		if (!session) throw error(401)

		return tryOrFail(async () => {
			const avatarUrl = new URL('https://api.dicebear.com/7.x/thumbs/svg')
			avatarUrl.searchParams.append('seed', String(Math.random()))
			return prisma.user.update({
				where: { id: session.user.id },
				data: { avatarPlaceholder: avatarUrl.toString() },
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
}
