import { CheckIcon, OctagonAlertIcon, OctagonXIcon, XIcon, type IconProps } from '@lucide/svelte'
import type { Component } from 'svelte'
import type { Subscribe } from '@prisma/client'

export type SubscribeStatable = Pick<Subscribe, 'state' | 'createdBy' | 'isForcedValidation'> & {
	member: { isValidedByUser: boolean }
}

export type SubscribeStateDisplay = {
	icon: Component<IconProps>
	class: string
	/** Phrase complète, affichée en infobulle: elle dit aussi qui attend quoi. */
	label: string
}

/**
 * Traduit l'état d'une inscription en icône, couleur et libellé.
 * `SUBSCRIBE_STATE` ne suffit pas: le rendu dépend aussi de qui a créé l'inscription,
 * de la validation forcée et de l'adhésion du membre à l'évènement.
 */
export function getSubscribeState(subscribe: SubscribeStatable): SubscribeStateDisplay {
	const { state, createdBy, isForcedValidation, member } = subscribe

	// Une annulation ou une demande vient du camp d'en face par rapport à une acceptation
	// ou un refus: l'auteur du changement n'est donc pas toujours celui de l'inscription.
	const changeAuthor =
		(createdBy === 'user') === (state === 'cancelled' || state === 'request')
			? 'par le membre'
			: 'par un responsable'

	if (state === 'request') {
		if (createdBy === 'leader' && !member.isValidedByUser)
			return {
				icon: OctagonAlertIcon,
				class: 'text-error',
				label: 'En attente de validation du membre (inactif)',
			}
		return {
			icon: OctagonAlertIcon,
			class: 'text-warning',
			label: `En attente de validation ${createdBy === 'user' ? `d'un responsable` : `du membre`}`,
		}
	}

	if (state === 'accepted') {
		if (isForcedValidation)
			return {
				icon: CheckIcon,
				class: 'text-blue-500',
				label: 'Inscription confirmée par un responsable au nom du membre',
			}
		return {
			icon: CheckIcon,
			class: 'text-success',
			label: `Inscription confirmée ${changeAuthor}`,
		}
	}

	if (state === 'denied')
		return {
			icon: OctagonXIcon,
			class: 'text-error',
			label: `Inscription déclinée ${changeAuthor}`,
		}

	return { icon: XIcon, class: 'text-error', label: `Inscription annulée ${changeAuthor}` }
}
