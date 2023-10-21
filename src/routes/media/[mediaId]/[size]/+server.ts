import path from 'node:path'
import fs from 'node:fs/promises'
import { MEDIA_DIR } from '$env/static/private'
import { error } from '@sveltejs/kit'

export const GET = async ({ params: { mediaId, size } }) => {
	const pathName = path.resolve(MEDIA_DIR, `${mediaId}-${size}.webp`)
	try {
		const buffer = await fs.readFile(pathName)
		return new Response(buffer)
	} catch {
		throw error(404)
	}
}
