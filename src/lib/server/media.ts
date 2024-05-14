import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import { z } from 'fuma/validation'
import { parseFormData } from 'fuma/server'
import type { Prisma } from '@prisma/client'
import { prisma } from './prisma'
import { MEDIA_DIR } from '$env/static/private'
import { error } from '@sveltejs/kit'

type UploadOption = {
	key?: string
	where?: Prisma.MediaWhereInput
	data: Prisma.MediaCreateArgs['data']
}
export const media = {
	async upload(requestOrFormData: Request | FormData, opt: UploadOption) {
		const keyImage = opt.key ? `${opt.key}_image` : 'image'
		const keyCrop = opt.key ? `${opt.key}_crop` : 'crop'

		const { data, formData } = await parseFormData(requestOrFormData, {
			[keyImage]: z.instanceof(File),
			[keyCrop]: z
				.string()
				.transform((v) => (v === 'undefined' ? undefined : v))
				.pipe(
					z
						.json({
							x: z.number(),
							y: z.number(),
							width: z.number(),
							height: z.number(),
						})
						.optional()
				)
				.optional(),
		})

		const image = data[keyImage] as Blob
		const crop = data[keyCrop] as { x: number; y: number; width: number; height: number }

		if (image.size === 0) return
		if (crop === undefined) return

		const imageBuffer = await image.arrayBuffer()

		const media = await createOrUpsertMedia(opt)
		const mediaPath = path.resolve(MEDIA_DIR, media.id)

		await fs
			.access(mediaPath, fs.constants.R_OK)
			.catch(() => {})
			.then(async () => await fs.rm(mediaPath, { recursive: true, force: true }))
			.finally(async () => await fs.mkdir(mediaPath, { recursive: true }))

		await sharp(imageBuffer)
			.extract({
				left: crop.x,
				top: crop.y,
				width: crop.width,
				height: crop.height,
			})
			.toFile(path.resolve(mediaPath, 'original.webp'))

		return media
	},

	async delete(where: Prisma.MediaWhereInput) {
		const media = await prisma.media.findFirst({ where })
		if (!media) error(404)
		const mediaPath = path.resolve(MEDIA_DIR, media.id)
		await fs.rm(mediaPath, { recursive: true, force: true })
		return prisma.media.delete({ where: { id: media.id } })
	},
}

function createOrUpsertMedia(opt: UploadOption) {
	if (opt.where) return upsertMedia(opt)
	return prisma.media.create({ data: opt.data })
}

async function upsertMedia(opt: UploadOption) {
	let media = await prisma.media.findFirst({
		where: opt.where,
	})
	return prisma.media.upsert({
		where: { id: media?.id || '' },
		update: opt.data,
		create: opt.data,
	})
}
