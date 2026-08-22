<script lang="ts">
	import Distribution from '$lib/Distribution.svelte'
	import { SUBSCRIBE_STATE } from '$lib/constant'
	import { eventPath } from '$lib/store'
	import type { MembershipDistKey } from './+page.server'

	interface Props {
		stats: {
			membership: Record<MembershipDistKey, number>
			subscribes: Record<keyof typeof SUBSCRIBE_STATE, number>
			teams: number
			periods: number
			places: number
		}
	}

	let { stats }: Props = $props()

	const MEMBERSHIP_LABEL: Record<MembershipDistKey, string> = {
		isValided: 'Validé',
		isValidedByEvent: 'Invitation en attente',
		isValidedByUser: 'Candidature à valider',
	}

	// Les liens partent vers les tables, filtrées: un chiffre du tableau de bord doit pouvoir
	// s'ouvrir sur la liste qu'il résume.
	const membersHref = (params: Record<string, string>) =>
		`${$eventPath}/admin/members?${new URLSearchParams(params)}`
	const subscribesHref = (params: Record<string, string>) =>
		`${$eventPath}/admin/subscribes?${new URLSearchParams(params)}`

	let covered = $derived(
		stats.places ? Math.round((stats.subscribes.accepted / stats.places) * 100) : 0
	)
</script>

{#snippet figure(value: string | number, label: string, href: string)}
	<span class="text-right font-medium">{value}</span>
	<a class="menu-item min-w-0" {href}>
		<span class="text-ellipsis overflow-hidden">{label}</span>
	</a>
{/snippet}

<div class="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
	<Distribution
		title="Adhésions"
		values={stats.membership}
		getLabel={(key) => MEMBERSHIP_LABEL[key]}
		getHref={(key) =>
			membersHref({
				isValidedByUser: String(key === 'isValided' || key === 'isValidedByUser'),
				isValidedByEvent: String(key === 'isValided' || key === 'isValidedByEvent'),
			})}
	/>

	<Distribution
		title="Inscriptions"
		values={stats.subscribes}
		getLabel={(key) => SUBSCRIBE_STATE[key].label}
		getHref={(key) => subscribesHref({ states: JSON.stringify([key]) })}
	/>

	<div class="border border-hard p-2 rounded-field">
		<h3 class="title-md p-2">Le dispositif</h3>
		<div
			class="grid gap-y-1 gap-x-2 text-sm items-center p-1"
			style:grid-template-columns="min-content auto"
		>
			{@render figure(stats.teams, stats.teams > 1 ? 'Secteurs' : 'Secteur', `${$eventPath}/teams`)}
			{@render figure(
				stats.periods,
				stats.periods > 1 ? 'Créneaux' : 'Créneau',
				`${$eventPath}/admin/plan`
			)}
			{@render figure(stats.places, 'Places à pourvoir', `${$eventPath}/admin/plan`)}
			{@render figure(
				`${covered}%`,
				'Places pourvues',
				subscribesHref({ states: JSON.stringify(['accepted']) })
			)}
		</div>
	</div>
</div>
