import { auth } from '$lib/server'
import type { Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'
import z from 'zod'

// zod finalise ses messages au parse, pas à la construction du schéma: les poser ici, une fois au
// démarrage du serveur, les traduit tous quel que soit l'ordre d'import des modèles. C'est bien le
// serveur qui valide — `form()` parse le schéma côté serveur et renvoie les issues au client.
z.config(z.locales.fr())

const authentication: Handle = async ({ event, resolve }) => {
	event.locals.auth = auth.handleRequest(event)
	return await resolve(event)
}

export const handle = sequence(authentication)
