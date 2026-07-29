import { form } from '$app/server'
import { bus } from './bus'

export const sendEvent = form(async () => {
	bus.emit('hey', 'prout')
})
