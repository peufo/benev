import path from 'node:path'
import fs from 'node:fs/promises'
import { MEDIA_DIR } from '$env/static/private'
import { error } from '@sveltejs/kit'

export const GET = async ({ params }) => {
	const filePath = path.resolve(MEDIA_DIR, params.path)
	try {
		const buffer = await fs.readFile(filePath)
		return new Response(buffer)
	} catch {
		throw error(404)
	}
}
