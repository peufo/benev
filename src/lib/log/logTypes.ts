import type { Log } from '@prisma/client'

/**
 * Les briques partagées par les transformations de `logMap.ts` et par les composants du fil.
 *
 * Module feuille, sans import de composant: c'est lui que `app.d.ts` lit pour typer la colonne
 * `data`, et un baril chargeant du Svelte n'y aurait pas sa place.
 */

/**
 * Une ligne du journal telle que les pages la transmettent. `event` n'est joint que pour
 * l'affichage inter-évènement de `/root/logs`: tout le reste est figé dans `data`.
 */
export type LogWithEvent = Log & { event: { id: string; name: string } | null }

/**
 * L'auteur d'une action. Satisfait structurellement par le retour de `permission.*`
 * (`MemberWithComputedValuesAndAccount`) comme par `session.user` de Lucia: aucun point d'appel
 * n'a d'adaptateur à écrire.
 */
export type LogActor = {
	userId: string
	firstName: string
	lastName: string
}

/** Une modification, réduite aux clés qui ont bougé (voir `pickChanges`). */
export type LogUpdate<T> = { before: Partial<T>; after: Partial<T> }

/**
 * Ce qu'une transformation rend: les colonnes de relation, puis la charge utile.
 *
 * Les colonnes sont déclarées ici plutôt que dérivées de `Prisma.LogUncheckedCreateInput`: le
 * contrat reste lisible, et rien de Prisma n'entre dans le graphe client.
 */
export type LogOutput<Data> = {
	eventId?: string | null
	memberId?: string | null
	teamId?: string | null
	userId?: string | null
	createdById?: string | null
	data: Data
}

/** Une entité citée par le journal: son id pour le lien, son nom figé pour l'affichage. */
export type LogRef = { id: string; name: string }

export function refActor(actor: LogActor): LogRef {
	return { id: actor.userId, name: `${actor.firstName} ${actor.lastName}` }
}

export function refPerson({
	id,
	firstName,
	lastName,
}: {
	id: string
	firstName: string
	lastName: string
}): LogRef {
	return { id, name: `${firstName} ${lastName}` }
}

/**
 * Les clés dont la valeur a changé, et elles seules.
 *
 * Les deux instantanés sont déjà passés par une projection: c'est elle qui tient la liste
 * blanche, et qui garantit des primitives — un `Date` traverserait la colonne JSON en chaîne,
 * et le type dérivé mentirait à la lecture.
 */
export function diffChanges<T extends object>(before: T, after: T): LogUpdate<T> {
	const changed: LogUpdate<T> = { before: {}, after: {} }
	for (const key of Object.keys(after) as (keyof T)[]) {
		if (!isDifferent(before[key], after[key])) continue
		changed.before[key] = before[key]
		changed.after[key] = after[key]
	}
	return changed
}

/** Vrai quand il y a quelque chose à montrer: inutile de journaliser une soumission sans effet. */
export function hasChanges(update: LogUpdate<object>): boolean {
	return Object.keys(update.after).length > 0
}

/** Une date telle que la colonne JSON la rendra: en chaîne ISO, jamais en `Date`. */
export function iso(date: Date | string | null | undefined): string | null {
	if (!date) return null
	return date instanceof Date ? date.toISOString() : date
}

function isDifferent(a: unknown, b: unknown): boolean {
	if (a && b && typeof a === 'object' && typeof b === 'object') {
		return JSON.stringify(a) !== JSON.stringify(b)
	}
	// Une chaîne vide et `null` disent la même chose dans un formulaire: ne pas les opposer.
	if (!a && !b) return false
	return a !== b
}
