<script lang="ts">
	import { TabsIcon } from '$lib/ui'
	import TableViewSelect from '$lib/view/TableViewSelect.svelte'
	import { InputMultiSelect, jsonParse, tip, urlParam } from 'fuma'
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { PeriodCardOptions } from './cardContent'
	import { eventPath } from '$lib/store'
	import PlanCursor from './PlanCursor.svelte'
	import type { Plan } from './types'
	import { clampScale, persistHourSize, withHourSize } from './zoom'
	import {
		AlignStartHorizontalIcon,
		AlignStartVerticalIcon,
		ExternalLinkIcon,
		ZoomInIcon,
		ZoomOutIcon,
	} from '@lucide/svelte'

	type TeamOption = { id: string; name: string }

	interface Props {
		teams: TeamOption[]
		views: { id: string; name: string; query: string }[]
		isFullscreen?: boolean
		plan: Plan
		class?: string
	}

	let {
		teams,
		views,
		isFullscreen = false,
		plan = $bindable(),
		class: klass = '',
	}: Props = $props()

	// L'échelle est un réglage d'affichage, pas une destination: elle s'applique ici et ne passe
	// par l'URL que pour y laisser une trace. Un lien rechargerait le plan à chaque cran.
	function zoom(factor: number) {
		const hourSize = clampScale(plan.hourSize * factor)
		plan = withHourSize(plan, hourSize)
		persistHourSize(hourSize)
	}

	// Dérivé assignable: la sélection vit dans l'URL — c'est le contrat que lit `getPlanData` —
	// mais `InputMultiSelect` la porte en items. Le dérivé se ré-amorce à chaque navigation, ce
	// qui fait suivre les boutons précédent/suivant du navigateur.
	let selectedTeams = $derived(
		jsonParse<string[]>($page.url.searchParams.get('teams'), []).flatMap(
			(id) => teams.find((team) => team.id === id) ?? []
		)
	)

	function selectTeams(selection: TeamOption[]) {
		const ids = selection.map(({ id }) => id)
		const url = ids.length
			? urlParam.with({ teams: JSON.stringify(ids) })
			: urlParam.without('teams')
		goto(url, { replaceState: true, noScroll: true, keepFocus: true })
	}
</script>

<div class="flex gap-2 items-center p-2 bg-base-100 {klass}" style="--btn-text-case: none;">
	{#if !isFullscreen}
		<h2 class="title px-2">Planification</h2>
		<div class="grow"></div>
	{/if}

	<!-- Le zoom et l'orientation sont des réglages d'affichage, propres à l'écran du moment. -->
	<TableViewSelect key="plan" {views} ignoredKeys={['hourSize', 'axis']} />

	<InputMultiSelect
		bind:value={selectedTeams}
		onSelect={selectTeams}
		items={teams}
		getLabel={(team) => team.name}
		searchable
		placeholder="Tous les secteurs"
		class="w-52! input-sm"
	/>

	<PlanCursor cursor={plan.cursor} />
	<div class="join">
		<button
			type="button"
			class="btn btn-sm btn-square join-item"
			aria-label="Dézoomer"
			onclick={() => zoom(0.85)}
		>
			<ZoomOutIcon size={18} opacity={0.8} />
		</button>
		<button
			type="button"
			class="btn btn-sm btn-square join-item"
			aria-label="Zoomer"
			onclick={() => zoom(1.15)}
		>
			<ZoomInIcon size={18} opacity={0.8} />
		</button>
	</div>

	<PeriodCardOptions />

	<TabsIcon
		key="axis"
		defaultValue="x"
		options={[
			{ label: 'Vue horizontal', icon: AlignStartVerticalIcon, value: 'x' },
			{ label: 'Vue vertical', icon: AlignStartHorizontalIcon, value: 'y' },
		]}
	/>

	<a
		href="{$eventPath}/admin/plan{isFullscreen ? '' : '/fullscreen'}{$page.url.search}"
		class="btn btn-square btn-sm"
	>
		<span class="inline-flex" use:tip={{ content: 'Ouvrir en plein écran' }}
			><ExternalLinkIcon class="opacity-80 {isFullscreen ? 'rotate-180' : ''}" /></span
		>
	</a>
</div>

<style>
	:root {
		print-color-adjust: exact;
	}
</style>
