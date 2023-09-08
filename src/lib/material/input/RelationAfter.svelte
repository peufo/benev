<script lang="ts">
	import { fade } from 'svelte/transition'
	import { createEventDispatcher } from 'svelte'
	import { mdiClose, mdiLoading, mdiPlus } from '@mdi/js'

	import Icon from '$lib/material/Icon.svelte'

	export let isLoading: boolean
	export let isUnselectable = false
	export let createUrl = ''
	export let createTitle = ''

	const dispatch = createEventDispatcher<{ unselect: void; create: void }>()
</script>

{#if isLoading}
	<div class="absolute right-1" class:right-10={createUrl} transition:fade|local>
		<Icon
			path={mdiLoading}
			class="w-9"
			classSVG="animate-spin fill-primary-ligther stroke-primary-ligther"
		/>
	</div>
{/if}

{#if isUnselectable}
	<div class="ml-[4px] -translate-x-[2px] hidden group-hover:block">
		<Icon
			path={mdiClose}
			on:click={() => dispatch('unselect')}
			title="Supprimer la sélection"
			class="outline outline-2 outline-primary-light hover:bg-primary"
		/>
	</div>
{/if}

{#if createUrl}
	<div class="ml-[4px] -translate-x-[2px]">
		<Icon
			path={mdiPlus}
			on:click={() => dispatch('create')}
			title={createTitle}
			class="btn btn-square"
		/>
	</div>
{/if}
