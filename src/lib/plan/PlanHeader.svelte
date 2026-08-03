<script lang="ts">
	import { TabsIcon } from '$lib/ui'
	import TableViewSelect from '$lib/view/TableViewSelect.svelte'
	import { InputMultiSelect, jsonParse, tip, urlParam, type PopoverType } from 'fuma'
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { PeriodCardOptions } from './cardContent'
	import { eventPath } from '$lib/store'
	import PlanCursor from './PlanCursor.svelte'
	import type { Plan } from './types'
	import {
		AlignLeftIcon,
		Columns3Icon,
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

	let { teams, views, isFullscreen = false, plan, class: klass = '' }: Props = $props()

	// Dérivé assignable: la sélection vit dans l'URL — c'est le contrat que lit `getPlanData` —
	// mais `InputMultiSelect` la porte en items. Le dérivé se ré-amorce à chaque navigation, ce
	// qui fait suivre les boutons précédent/suivant du navigateur.
	let selectedTeams = $derived(
		jsonParse<string[]>($page.url.searchParams.get('teams'), []).flatMap(
			(id) => teams.find((team) => team.id === id) ?? []
		)
	)

	let teamsMenu = $state<{ popover: PopoverType }>()
	let menuWasOpen = false
	// Le plan est la page la plus lourde de l'application: l'URL n'est écrite qu'à la fermeture
	// du menu, pas à chaque secteur coché, pour ne la recharger qu'une fois.
	$effect(() => {
		const isOpen = !!teamsMenu?.popover.isOpen
		if (menuWasOpen && !isOpen) {
			const ids = selectedTeams.map(({ id }) => id)
			const url = ids.length
				? urlParam.with({ teams: JSON.stringify(ids) })
				: urlParam.without('teams')
			goto(url, { replaceState: true, noScroll: true })
		}
		menuWasOpen = isOpen
	})
</script>

<div class="flex gap-2 items-center p-2 bg-base-100 {klass}" style="--btn-text-case: none;">
	{#if !isFullscreen}
		<h2 class="title px-2">Planification</h2>
		<div class="grow"></div>
	{/if}

	<TableViewSelect key="plan" {views} />

	<!-- Le layout admin a déjà chargé tous les secteurs: le filtre reste local. `searchable`
	     explicite, leur nombre variant d'un évènement à l'autre. -->
	<InputMultiSelect
		bind:this={teamsMenu}
		bind:value={selectedTeams}
		items={teams}
		getLabel={(team) => team.name}
		searchable
		placeholder="Tous les secteurs"
		class="w-52"
	/>

	<PlanCursor cursor={plan.cursor} />
	<div class="join">
		<a
			class="btn btn-sm btn-square join-item"
			href={urlParam.with({ hourSize: Math.max(5, plan.hourSize * 0.85) })}
			data-sveltekit-replacestate
		>
			<ZoomOutIcon size={18} opacity={0.8} />
		</a>
		<a
			class="btn btn-sm btn-square join-item"
			href={urlParam.with({ hourSize: Math.min(100, plan.hourSize * 1.15) })}
			data-sveltekit-replacestate
		>
			<ZoomInIcon size={18} opacity={0.8} />
		</a>
	</div>

	<PeriodCardOptions />

	<TabsIcon
		key="axis"
		defaultValue="x"
		options={[
			{ label: 'Vue horizontal', icon: AlignLeftIcon, value: 'x' },
			{ label: 'Vue vertical', icon: Columns3Icon, value: 'y' },
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
