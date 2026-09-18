<script lang="ts">
	import type { Team, TeamState } from '@prisma/client'
	import type { ClassValue } from 'svelte/elements'
	import { page } from '$app/state'
	import { TEAM_STATES } from '$lib/constant'
	import { StateMenu } from '$lib/ui'
	import { setTeamState } from './team.remote'

	interface Props {
		/**
		 * En brouillon, l'inscription libre est refusée: toutes les demandes en attente viennent
		 * d'un responsable, et leur compte est celui des courriels qui partiront.
		 */
		team: Pick<Team, 'id' | 'state'> & { nbSubscribesRequest?: number }
		/** Sans droit sur le secteur, l'état se lit sans menu. */
		canEdit?: boolean
		class?: ClassValue
	}

	let { team, canEdit = false, class: klass }: Props = $props()

	type Target = Exclude<TeamState, 'draft'>
	type Transition = { state: Target; label: string; confirm?: string }

	// Sans inscription libre dans l'évènement, il n'y a pas d'inscriptions à ouvrir: publier ne
	// fait que lister le secteur.
	const open = $derived(!!page.data.event?.selfSubscribeAllowed)

	const confirmation = $derived.by(() => {
		const pending = team.nbSubscribesRequest ?? 0
		const emails =
			pending === 0
				? ''
				: `${pending} demande${pending > 1 ? 's' : ''} d'inscription partir${pending > 1 ? 'ont' : 'a'} aux bénévoles.`
		return `${emails} Un fois validé, un secteur ne peut pas être repassé en brouillon.`
	})

	const transitions: Record<TeamState, Transition[]> = $derived({
		draft: [
			{ state: 'validated', label: 'Valider', confirm: confirmation },
			{
				state: 'published',
				label: open ? 'Valider et ouvrir les inscriptions' : 'Valider et publier',
				confirm: confirmation,
			},
		],
		validated: [{ state: 'published', label: open ? 'Ouvrir les inscriptions' : 'Publier' }],
		published: [
			{ state: 'validated', label: open ? 'Fermer les inscriptions' : 'Retirer de la liste' },
		],
	})
</script>

<StateMenu
	states={TEAM_STATES}
	state={team.state}
	transitions={canEdit ? transitions[team.state] : []}
	form={setTeamState}
	id={team.id}
	class={klass}
/>
