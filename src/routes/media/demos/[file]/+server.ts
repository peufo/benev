import path from 'node:path'
import fs from 'node:fs/promises'
import { createReadStream } from 'node:fs'
import { Readable } from 'node:stream'
import { MEDIA_DIR } from '$app/env/private'
import { error } from '@sveltejs/kit'

/**
 * Les vidéos de démo de la landing, déposées dans `MEDIA_DIR/demos` par `bun run demo:publish`.
 *
 * Le nom porte le hash du contenu: il ne change jamais de sens, d'où le cache immuable. Le motif
 * strict est aussi ce qui empêche de sortir du dossier.
 */
const FILE_NAME = /^[a-z0-9-]+\.[0-9a-f]{8}\.(mp4|jpg)$/
const TYPES = { mp4: 'video/mp4', jpg: 'image/jpeg' }

export const GET = async ({ params, request }) => {
	const match = params.file.match(FILE_NAME)
	if (!match) error(404)
	const filePath = path.resolve(MEDIA_DIR, 'demos', params.file)
	const stat = await fs.stat(filePath).catch(() => null)
	if (!stat?.isFile()) error(404)

	const size = stat.size
	const headers: Record<string, string> = {
		'content-type': TYPES[match[1] as keyof typeof TYPES],
		'accept-ranges': 'bytes',
		'cache-control': 'public, max-age=31536000, immutable',
	}

	// Safari refuse de lire une vidéo dont le serveur ne répond pas aux plages.
	const range = request.headers.get('range')
	if (!range) {
		return new Response(stream(filePath), {
			headers: { ...headers, 'content-length': String(size) },
		})
	}

	const bounds = parseRange(range, size)
	if (!bounds) {
		return new Response(null, {
			status: 416,
			headers: { ...headers, 'content-range': `bytes */${size}` },
		})
	}
	const [start, end] = bounds
	return new Response(stream(filePath, start, end), {
		status: 206,
		headers: {
			...headers,
			'content-range': `bytes ${start}-${end}/${size}`,
			'content-length': String(end - start + 1),
		},
	})
}

function stream(filePath: string, start?: number, end?: number) {
	return Readable.toWeb(createReadStream(filePath, { start, end })) as ReadableStream
}

/** Une seule plage, `bytes=a-b`, `bytes=a-` ou `bytes=-n`: c'est tout ce qu'envoie un lecteur. */
function parseRange(header: string, size: number): [number, number] | null {
	const match = header.match(/^bytes=(\d*)-(\d*)$/)
	if (!match || (!match[1] && !match[2])) return null
	let start: number
	let end: number
	if (!match[1]) {
		start = Math.max(0, size - Number(match[2]))
		end = size - 1
	} else {
		start = Number(match[1])
		end = match[2] ? Math.min(Number(match[2]), size - 1) : size - 1
	}
	if (start > end || start >= size) return null
	return [start, end]
}
