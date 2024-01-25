import { createSSE } from '$lib/server'
import { EventEmitter } from 'node:events'

export const eventEmitter = new EventEmitter()

export const GET = () => {
	const { readable, subscribe } = createSSE()

	subscribe(eventEmitter, 'send_email')

	return new Response(readable, {
		headers: {
			'cache-control': 'no-cache',
			'content-type': 'text/event-stream',
		},
	})
}
