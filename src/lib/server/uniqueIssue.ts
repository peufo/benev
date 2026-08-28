import { Prisma } from '@prisma/client'
import { invalid } from '@sveltejs/kit'

/**
 * MySQL nomme son index `Modèle_champ1_champ2_key`, et Prisma le transmet tel quel dans
 * `meta.target`. Le nom d'un champ y suffit donc à trancher entre deux contraintes d'un même
 * modèle. Sans `field`, n'importe quelle violation d'unicité correspond.
 */
export function isUniqueConstraintError(err: unknown, field?: string): boolean {
	if (!(err instanceof Prisma.PrismaClientKnownRequestError)) return false
	if (err.code !== 'P2002') return false
	if (!field) return true
	return String(err.meta?.target ?? '').includes(field)
}

/**
 * Une contrainte d'unicité violée est une exception Prisma: non rattrapée dans une `form()`,
 * elle atteint le client en 500 opaque là où l'utilisateur attend un message sous son champ.
 * Vérifier l'existence avant d'écrire ne suffit pas — deux soumissions simultanées passent
 * toutes deux le test — donc c'est bien l'erreur de la base qui fait foi.
 *
 * ```ts
 * const team = await prisma.team
 * 	.create({ data })
 * 	.catch(uniqueIssue(issue.name('Un secteur porte déjà ce nom')))
 * ```
 */
export function uniqueIssue(...issues: Parameters<typeof invalid>) {
	return (err: unknown): never => {
		if (isUniqueConstraintError(err)) invalid(...issues)
		throw err
	}
}
