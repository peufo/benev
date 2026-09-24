import { command, getRequestEvent } from '$app/server'
import z from 'zod'
import { permission } from '$lib/server'
import { getScheduler } from '$lib/server/tasks'

/** Exécute une tâche sans attendre son échéance: pour l'exploitation, et pour les tests E2E. */
export const runTask = command(z.object({ name: z.string() }), async ({ name }) => {
	const { locals } = getRequestEvent()
	await permission.root(locals)
	return getScheduler().runNow(name)
})
