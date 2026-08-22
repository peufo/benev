import { error } from '@sveltejs/kit'
import { form, getRequestEvent } from '$app/server'
import { createLog, permission, prisma } from '$lib/server'
import { modelEventState } from '$lib/models'

export const setEventState = form(modelEventState, async (data) => {
	const { locals, params } = getRequestEvent()
	const eventId = params.eventId!
	await permission.ownerOrRoot(eventId, locals)
	// `ownerOrRoot` rend `null` pour le root, qui n'est membre de rien: c'est la session qui
	// nomme l'acteur, valable dans les deux cas.
	const session = await locals.auth.validate()
	if (!session) error(401)

	const before = await prisma.event.findUniqueOrThrow({ where: { id: eventId } })
	const event = await prisma.event.update({ where: { id: eventId }, data })
	if (before.state !== event.state)
		await createLog('event_state', { event, before: before.state, actor: session.user })
})
