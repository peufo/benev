import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import type { Prisma } from '@prisma/client'
import { prisma } from './prisma'
import { env } from '$env/dynamic/private'
import { error } from '@sveltejs/kit'
import type { EventImagesInput, MediaImageInput } from '$lib/models/media'

type UploadOption = {
	where?: Prisma.MediaWhereInput
	data: Prisma.MediaCreateArgs['data']
}

export const media = {
	/**
	 * Le fichier et son recadrage arrivent déjà validés par le schéma de la remote function
	 * (`modelMediaImage` / `modelEventImages`): ce module ne relit plus le `FormData`.
	 */
	async upload({ image, crop }: MediaImageInput, opt: UploadOption) {
		if (!image || image.size === 0) throw new Error('image is not defined')
		if (crop === undefined) throw new Error('no crop data')

		const imageBuffer = await image.arrayBuffer()

		const media = await createOrReplaceMedia(opt)
		const mediaPath = path.resolve(env.MEDIA_DIR, media.id)

		await fs
			.access(mediaPath, fs.constants.R_OK)
			.catch(() => ({}))
			.then(async () => await fs.rm(mediaPath, { recursive: true, force: true }))
			.finally(async () => await fs.mkdir(mediaPath, { recursive: true }))

		await sharp(imageBuffer)
			.rotate()
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
		const mediaPath = path.resolve(env.MEDIA_DIR, media.id)
		await fs.rm(mediaPath, { recursive: true, force: true })
		return prisma.media.delete({ where: { id: media.id } })
	},
}

async function createOrReplaceMedia({ where, data }: UploadOption) {
	if (where) await media.delete(where).catch(() => undefined)
	return prisma.media.create({ data })
}

/**
 * Une image absente fait échouer `media.upload`. Les deux envois sont donc isolés: avant, un
 * seul `try` les enveloppait, et ne rien changer à l'affiche empêchait le logo de partir.
 */
export async function uploadImages(images: EventImagesInput, eventId: string, authorId: string) {
	await uploadOrLog({ image: images.poster_image, crop: images.poster_crop }, 'Affiche', {
		where: { posterOf: { id: eventId } },
		data: {
			name: 'Affiche',
			createdById: authorId,
			eventId,
			posterOf: { connect: { id: eventId } },
		},
	})
	await uploadOrLog({ image: images.logo_image, crop: images.logo_crop }, 'Logo', {
		where: { logoOf: { id: eventId } },
		data: {
			name: 'Logo',
			createdById: authorId,
			eventId,
			logoOf: { connect: { id: eventId } },
		},
	})
}

async function uploadOrLog(input: MediaImageInput, label: string, opt: UploadOption) {
	if (!input.image) return
	try {
		await media.upload(input, opt)
	} catch (err) {
		console.error(`Upload event image failed: ${label}`)
		console.error(err)
	}
}
