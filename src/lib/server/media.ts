import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import z from 'zod'
import type { Prisma } from '@prisma/client'
import { parseFormData } from './formData'
import { tryOrFail } from './try'
import { prisma } from './prisma'
import { MEDIA_DIR } from '$env/static/private'
import { error } from '@sveltejs/kit'

type UploadOption = {
	where: Prisma.MediaWhereInput
	data: Prisma.MediaCreateArgs['data']
	/** xy[] or [x, y][] */
	sizes: (number | [number, number])[]
}

export const media = {
	async delete(where: Prisma.MediaWhereInput) {
		return tryOrFail(async () => {
			const media = await prisma.media.findFirst({ where })
			if (!media) throw error(404)
			const mediaPath = path.resolve(MEDIA_DIR, media.id)
			await fs.rm(mediaPath, { recursive: true, force: true })
			return prisma.media.delete({ where: { id: media.id } })
		})
	},

	async upload(request: Request, opt: UploadOption) {
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

			let media = await prisma.media.findFirst({
				where: opt.where,
			})

			media = await prisma.media.upsert({
				where: { id: media?.id || '' },
				update: opt.data,
				create: opt.data,
			})

			const mediaPath = path.resolve(MEDIA_DIR, media.id)
			try {
				await fs.access(mediaPath, fs.constants.R_OK)
			} catch {
				await fs.mkdir(mediaPath, { recursive: true })
			}

			await Promise.all(
				opt.sizes.map((size) => {
					const [x, y] = typeof size === 'number' ? [size, size] : size
					const filePath = path.resolve(mediaPath, `${x}-${y}.webp`)
					return sharpStream.clone().resize(x, y).webp().toFile(filePath)
				})
			)

			return
		})
	},
}
