import { createSSE } from './sse'
import { bus } from './bus'

export async function GET({ request }) {
	// does not have to be a number, this is just an example
	const last_event_id = Number(request.headers.get('last-event-id')) || 0

	const { readable, subscribe } = createSSE(last_event_id)

	subscribe(bus, 'hey')
	subscribe(bus, 'hey')

	return new Response(readable, {
		headers: {
			'cache-control': 'no-cache',
			'content-type': 'text/event-stream',
		},
	})
}
