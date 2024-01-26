import { createSSE } from '$lib/server'
import { eventEmiter } from './eventEmitter'

export const GET = () => {
	const { readable, subscribe } = createSSE()

	subscribe(eventEmiter, 'send_email')

	return new Response(readable, {
		headers: {
			'cache-control': 'no-cache',
			'content-type': 'text/event-stream',
		},
	})
}
