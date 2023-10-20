import path from 'node:path'
import fs from 'fs/promises'
import { MEDIA_DIR } from '$env/static/private'

export const GET = async ({ params: { mediaId, size } }) => {
	// Check existence, and right in media
	const pathName = path.resolve(MEDIA_DIR, `${mediaId}-${size}.webp`)

	const file = await fs.readFile(pathName)
	return new Response(file)
}
