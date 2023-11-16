import fs from 'node:fs/promises'
import path from 'node:path'
import jimp from 'jimp'
import { z } from '$lib/validation'
import type { Prisma } from '@prisma/client'
import { parseFormData } from './formData'
import { prisma } from './prisma'
import { MEDIA_DIR } from '$env/static/private'
import { error } from '@sveltejs/kit'

type UploadOption = {
	key?: string
	where: Prisma.MediaWhereInput
	data: Prisma.MediaCreateArgs['data']
}
export const media = {
	async upload(requestOrFormData: Request | FormData, opt: UploadOption) {
		const keyImage = opt.key ? `${opt.key}_image` : 'image'
		const keyCrop = opt.key ? `${opt.key}_crop` : 'crop'
		const { data, err } = await parseFormData(
			requestOrFormData,
			z.object({
				[keyImage]: z.instanceof(Blob),
				[keyCrop]: z.json({
					x: z.number(),
					y: z.number(),
					width: z.number(),
					height: z.number(),
				}),
			})
		)
		if (err) return err
		const image = data[keyImage] as Blob
		const crop = data[keyCrop] as { x: number; y: number; width: number; height: number }

		if (image.size === 0) return

		console.log(image, crop)
		const imageBuffer = await image.arrayBuffer()

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
			await fs.rm(mediaPath, { recursive: true, force: true })
		} finally {
			await fs.mkdir(mediaPath, { recursive: true })
		}

		const jimpImage = await jimp.read(Buffer.from(imageBuffer))
		jimpImage
			.crop(crop.x, crop.y, crop.width, crop.height)
			.writeAsync(path.resolve(mediaPath, `original.png`))

		return
	},

	async delete(where: Prisma.MediaWhereInput) {
		const media = await prisma.media.findFirst({ where })
		if (!media) throw error(404)
		const mediaPath = path.resolve(MEDIA_DIR, media.id)
		await fs.rm(mediaPath, { recursive: true, force: true })
		return prisma.media.delete({ where: { id: media.id } })
	},
}
