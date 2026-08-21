import { auth, closeTransporter, drainEmailQueue } from '$lib/server'
import type { Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'
import z from 'zod'

// zod finalise ses messages au parse, pas à la construction du schéma: les poser ici, une fois au
// démarrage du serveur, les traduit tous quel que soit l'ordre d'import des modèles. C'est bien le
// serveur qui valide — `form()` parse le schéma côté serveur et renvoie les issues au client.
z.config(z.locales.fr())

// `adapter-node` n'appelle jamais `process.exit()`: il ferme le serveur HTTP puis émet cet
// évènement, et le processus s'éteint quand la boucle est vide. La file d'emails a donc le temps
// de finir, et ce qu'elle abandonne au-delà du délai laisse une trace dans le journal.
// `removeAllListeners` garde l'inscription idempotente: en dev, Vite réévalue ce module.
process.removeAllListeners('sveltekit:shutdown')
process.on('sveltekit:shutdown', async () => {
	await drainEmailQueue({ timeout: 10_000 })
	closeTransporter()
})

const authentication: Handle = async ({ event, resolve }) => {
	event.locals.auth = auth.handleRequest(event)
	return await resolve(event)
}

export const handle = sequence(authentication)
