import * as devalue from 'devalue'

export function json(data: unknown, init?: ResponseInit) {
	const body = devalue.stringify(data)

	const headers = new Headers(init?.headers)
	if (!headers.has('content-length')) {
		headers.set('content-length', encoder.encode(body).byteLength.toString())
	}

	if (!headers.has('content-type')) {
		headers.set('content-type', 'application/json')
	}

	return new Response(body, {
		...init,
		headers,
	})
}

const encoder = new TextEncoder()
