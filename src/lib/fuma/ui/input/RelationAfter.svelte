<script lang="ts">
	import { fade } from 'svelte/transition'
	import { createEventDispatcher } from 'svelte'
	import { mdiLoading, mdiPlus } from '@mdi/js'

	import Icon from '$lib/fuma/ui/icon/Icon.svelte'

	interface Props {
		isLoading: boolean;
		createUrl?: string;
		createTitle?: string;
		createIcon?: any;
	}

	let {
		isLoading,
		createUrl = '',
		createTitle = '',
		createIcon = mdiPlus
	}: Props = $props();

	const dispatch = createEventDispatcher<{ unselect: void; create: void }>()
</script>

{#if isLoading}
	<div in:fade|local>
		<Icon
			path={mdiLoading}
			class="w-9"
			classSVG="animate-spin fill-primary-ligther stroke-primary-ligther"
		/>
	</div>
{:else if createUrl}
	<a
		href={createUrl}
		class="btn btn-square btn-sm"
		in:fade|local={{ duration: 200 }}
		data-sveltekit-noscroll
		data-sveltekit-replacestate
	>
		<Icon path={createIcon} on:click={() => dispatch('create')} title={createTitle} />
	</a>
{/if}
