import type { Member, Tag, Team } from '@prisma/client'
import { page } from '$app/state'
import { urlParam } from 'fuma'

/** L'identité de l'appelant, pour les deux tiroirs qui se renvoient l'un à l'autre. */
export type DrawerFrom = 'team' | 'invite'

type DrawerCall<Created, Updated = Created> = {
	/** Le formulaire ouvert s'en sert pour cacher le champ qui rouvrirait l'appelant. */
	from?: DrawerFrom
	oncreated?: (record: Created) => void
	onupdated?: (record: Updated) => void
	ondeleted?: (id: string) => void
}

export type DrawerLinkAttributes = {
	href: string
	onclick: () => void
	'data-sveltekit-noscroll': true
	'data-sveltekit-replacestate': true
}

type LinkOptions = {
	/** La valeur du paramètre: `'{}'` pour une création, l'id pour une édition (`parseFormKey`). */
	value?: string
	/** Joué avant l'enregistrement — refermer le popover qui porte le lien, typiquement. */
	onclick?: () => void
}

/**
 * Les tiroirs de `DrawersForm` vivent à la racine de l'évènement, hors de l'arbre de l'appelant —
 * lequel peut d'ailleurs être rendu à même la page, comme le `TeamForm` de `/admin/teams/[teamId]`.
 * Le lien qui ouvre le tiroir est donc le seul à savoir qui appelle et ce qu'il attend en retour.
 *
 * Écrit depuis un `onclick`, donc jamais au rendu serveur: rien ne fuit d'une requête à l'autre.
 */
function drawerCall<Created, Updated = Created>(key: string) {
	let call = $state<DrawerCall<Created, Updated>>()

	return {
		/** À étaler sur le lien: il pose l'URL du tiroir et enregistre ce qu'on attend en retour. */
		link(
			next: DrawerCall<Created, Updated>,
			{ value = '{}', onclick }: LinkOptions = {}
		): DrawerLinkAttributes {
			return {
				href: urlParam.with({ [key]: value }),
				onclick: () => {
					onclick?.()
					call = next
				},
				'data-sveltekit-noscroll': true,
				'data-sveltekit-replacestate': true,
			}
		},
		/** Tant que le tiroir porte sa clé: une ouverture à l'URL nue n'hérite de rien. */
		get current() {
			return page.url.searchParams.has(key) ? call : undefined
		},
	}
}

export const inviteCall = drawerCall<Member>('form_invite')
export const teamCall = drawerCall<Team>('form_team')
export const tagCall = drawerCall<Tag>('form_tag')
