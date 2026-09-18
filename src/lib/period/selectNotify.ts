import { CheckIcon, MailsIcon } from '@lucide/svelte'
import { selectDialog } from 'fuma'

/**
 * Hors brouillon, l'horaire est déjà dans la boîte des inscrit·es: c'est à l'organisateur·ice de
 * dire si la retouche mérite un nouveau courriel. `true` prévenir, `false` en silence, `undefined`
 * quand la modification est abandonnée. Le premier bouton, prévenir, reçoit le focus: Entrée garde
 * la voie la plus sûre.
 */
export async function selectNotify(engaged: number): Promise<boolean | undefined> {
	const s = engaged > 1 ? 's' : ''
	const choice = await selectDialog({
		title: 'Prévenir les inscrit·es ?',
		message: `${engaged} inscrit·e${s} ${engaged > 1 ? 'ont' : 'a'} déjà reçu cet horaire par courriel.`,
		options: [
			{ value: 'notify', label: 'Valider et notifier', icon: MailsIcon, class: 'btn-primary' },
			{ value: 'silent', label: 'Valider', icon: CheckIcon },
		],
	})
	if (choice === undefined) return undefined
	return choice === 'notify'
}
