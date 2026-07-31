<script lang="ts">
	import { fade } from 'svelte/transition'
	import { mdiLoading, mdiPlus } from '@mdi/js'

	import Icon from '$lib/fuma-legacy/ui/icon/Icon.svelte'

	interface Props {
		isLoading: boolean
		createUrl?: string
		createTitle?: string
		createIcon?: any
		/** Remplacent les évènements de la version Svelte 4. */
		onunselect?: () => void
		oncreate?: () => void
	}

	let {
		isLoading,
		createUrl = '',
		createTitle = '',
		createIcon = mdiPlus,
		onunselect,
		oncreate,
	}: Props = $props()
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
		onclick={() => oncreate?.()}
	>
		<Icon path={createIcon} title={createTitle} />
	</a>
{/if}
