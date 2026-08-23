import type { TeamWithComputedValues } from '$lib/server'

type TeamUpdater = (team: Partial<TeamWithComputedValues>) => Partial<TeamWithComputedValues>
type TeamFormUpdate = (updater: TeamUpdater) => void

// Écrit uniquement depuis un `$effect`, donc jamais au rendu serveur: ce module n'a pas d'état
// qui puisse fuiter d'une requête à l'autre.
const stack: TeamFormUpdate[] = []

/**
 * Le tiroir « inviter un membre » vit à la racine de l'évènement, hors de l'arbre du formulaire
 * de secteur — que celui-ci soit rendu en pleine page d'administration ou dans son propre tiroir.
 * Ce registre lui donne le formulaire à qui rendre le membre fraîchement invité.
 *
 * Une pile, et non un emplacement unique: le tiroir de création s'ouvre par-dessus le formulaire
 * de la page, et sa fermeture doit rendre la main à celui-ci plutôt que de laisser le vide.
 */
export function registerTeamForm(update: TeamFormUpdate) {
	$effect(() => {
		stack.push(update)
		return () => {
			const index = stack.indexOf(update)
			if (index !== -1) stack.splice(index, 1)
		}
	})
}

/** Sans formulaire de secteur monté, l'invitation reste une simple création de membre. */
export function updateActiveTeamForm(updater: TeamUpdater) {
	stack.at(-1)?.(updater)
}
