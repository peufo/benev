import { bus } from './bus'

export const actions = {
	send_event: async () => {
		bus.emit('hey', 'prout')
	},
}
