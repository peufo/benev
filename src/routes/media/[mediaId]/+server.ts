import path from 'node:path'
import fs from 'node:fs/promises'
import { MEDIA_DIR } from '$env/static/private'
import { error } from '@sveltejs/kit'
import { parseQuery } from '$lib/server'
import { z, toTuple } from '$lib/validation'
import { MEDIA_PRESETS } from '$lib/constants'
import jimp from 'jimp'

export const GET = async ({ url, params: { mediaId } }) => {
	const { size } = parseQuery(url, {
		size: z.enum(toTuple(MEDIA_PRESETS)).optional(),
	})

	const fileName = `${size || 'original'}.png`
	const filePath = path.resolve(MEDIA_DIR, mediaId, fileName)

	const buffer = await fs.readFile(filePath).catch(async () => {
		if (!size) return null
		try {
			const filePathOriginal = path.resolve(MEDIA_DIR, mediaId, 'original.png')
			const bufferOriginal = await fs.readFile(filePathOriginal)
			const jimpImage = await jimp.read(Buffer.from(bufferOriginal))
			const [x, y] = MEDIA_PRESETS[size]
			await jimpImage.resize(x, y).writeAsync(filePath)
			return await jimpImage.getBufferAsync('image/png')
		} catch {
			return null
		}
	})

	if (!buffer) throw error(404)
	return new Response(buffer)
}
