import path from 'node:path'
import fs from 'node:fs/promises'
import { env } from '$env/dynamic/private'
import { error } from '@sveltejs/kit'
import { parseQuery } from 'fuma/server'
import { z, toTuple } from 'fuma/validation'
import { MEDIA_PRESETS } from '$lib/constant'
import sharp from 'sharp'

export const GET = async ({ url, params: { mediaId } }) => {
	const data = parseQuery(url, {
		size: z.enum(toTuple(MEDIA_PRESETS)).optional(),
	})

	await ensurePngtoWebp(mediaId)
	const fileName = `${data.size || 'original'}.webp`
	const filePath = path.resolve(env.MEDIA_DIR, mediaId, fileName)

	const buffer = await fs.readFile(filePath).catch(async () => {
		if (!data.size) return null
		try {
			const filePathOriginal = path.resolve(env.MEDIA_DIR, mediaId, 'original.webp')
			const bufferOriginal = await fs.readFile(filePathOriginal)
			const [x, y] = MEDIA_PRESETS[data.size]
			const image = sharp(bufferOriginal).resize({ width: x, height: y })
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
	const pathPNG = path.resolve(env.MEDIA_DIR, mediaId, 'original.png')
	const pathWEBP = path.resolve(env.MEDIA_DIR, mediaId, 'original.webp')

	await fs
		.readFile(pathPNG)
		.then(async () => {
			await sharp(pathPNG).toFile(pathWEBP)
			await fs.rm(pathPNG)
		})
		.catch(() => {})
}
