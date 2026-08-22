import type { LogFamily } from './logLabels'
import type { LogWithEvent } from './logTypes'

/**
 * Ce qui restreint le fil. Le `load` le lit dans l'URL, `Journal.svelte` le renvoie tel quel pour
 * charger vers le haut: les deux doivent voir exactement le même ensemble.
 */
export type JournalFilter = {
	family?: LogFamily
	memberId?: string
	teamId?: string
}

/**
 * Ce qu'une page sert à `<Journal>`: la fenêtre du fil, et le filtre qui l'a produite.
 */
export type EventJournal = {
	logs: LogWithEvent[]
	hasMore: boolean
	filter: JournalFilter
	/** Le membre sur lequel le fil porte, nommé pour l'entête et la puce de filtre. */
	subject: { id: string; firstName: string; lastName: string } | null
	/**
	 * Le filtre membre vient de la route et non de l'URL: la fiche d'un membre ne propose pas de
	 * le retirer, elle n'aurait rien d'autre à montrer.
	 */
	pinned: boolean
}
