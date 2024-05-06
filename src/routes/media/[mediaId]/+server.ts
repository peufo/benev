import path from 'node:path'
import fs from 'node:fs/promises'
import { MEDIA_DIR } from '$env/static/private'
import { error } from '@sveltejs/kit'
import { parseQuery } from 'fuma/server'
import { z, toTuple } from 'fuma/validation'
import { MEDIA_PRESETS } from '$lib/constant'
import sharp from 'sharp'

export const GET = async ({ url, params: { mediaId } }) => {
	const { data, err } = parseQuery(url, {
		size: z.enum(toTuple(MEDIA_PRESETS)).optional(),
	})
	if (err) error(400)

	await ensurePngtoWebp(mediaId)
	const fileName = `${data.size || 'original'}.webp`
	const filePath = path.resolve(MEDIA_DIR, mediaId, fileName)

	const buffer = await fs.readFile(filePath).catch(async () => {
		if (!data.size) return null
		try {
			const filePathOriginal = path.resolve(MEDIA_DIR, mediaId, 'original.webp')
			const [x, y] = MEDIA_PRESETS[data.size]
			const image = sharp(filePathOriginal).resize({ width: x, height: y })
			await image.toFile(filePath)
			return await image.toBuffer()
		} catch {
			return null
		}
	})

	if (!buffer) error(404)
	return new Response(buffer, {
		headers: {
			'content-type': 'image/webp',
		},
	})
}

/** Migrate old png file to webp */
async function ensurePngtoWebp(mediaId: string) {
	const pathPNG = path.resolve(MEDIA_DIR, mediaId, 'original.png')
	const pathWEBP = path.resolve(MEDIA_DIR, mediaId, 'original.webp')

	await fs
		.readFile(pathPNG)
		.then(async () => {
			await sharp(pathPNG).toFile(pathWEBP)
			await fs.rm(pathPNG)
		})
		.catch(() => {})
}
