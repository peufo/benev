// thanks: https://github.com/sveltejs/kit/issues/5344#issuecomment-1265286081

import type { EventEmitter } from 'node:events'

export function createSSE(last_id = 0, retry = 0) {
	let id = last_id
	const { readable, writable } = new TransformStream({
		start(controller) {
			controller.enqueue(': hello\n\n')
			if (retry > 0) controller.enqueue(`retry: ${retry}\n\n`)
		},
		transform({ event, data }, controller) {
			let msg = `id: ${++id}\n`
			if (event) msg += `event: ${event}\n`
			if (typeof data === 'string') {
				msg += 'data: ' + data.trim().replace(/\n+/gm, '\ndata: ') + '\n'
			} else {
				msg += `data: ${JSON.stringify(data)}\n`
			}
			controller.enqueue(msg + '\n')
		},
	})

	const writer = writable.getWriter()

	return {
		readable,
		async subscribe(eventEmitter: EventEmitter, event: string) {
			function listener(data: any) {
				writer.write({ event, data })
			}

			eventEmitter.on(event, listener)
			await writer.closed.catch(() => {})
			eventEmitter.off(event, listener)
		},
	}
}
