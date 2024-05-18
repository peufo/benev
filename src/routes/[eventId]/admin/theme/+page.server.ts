import { modelEventTheme } from '$lib/models'
import { permission, prisma } from '$lib/server'
import { formAction } from 'fuma/server'

export const actions = {
	theme_update: formAction(modelEventTheme, async ({ locals, params: { eventId }, data }) => {
		await permission.owner(eventId, locals)
		console.log(data)
		return prisma.event.update({ where: { id: eventId }, data })
	}),
}
