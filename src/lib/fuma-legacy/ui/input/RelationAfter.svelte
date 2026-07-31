<script lang="ts">
	import { type IconProps, LoaderCircleIcon, PlusIcon } from '@lucide/svelte'
	import { tip } from 'fuma'
	import type { Component } from 'svelte'
	import { fade } from 'svelte/transition'

	interface Props {
		isLoading: boolean
		createUrl?: string
		createTitle?: string
		createIcon?: Component<IconProps>
		/** Remplacent les évènements de la version Svelte 4. */
		onunselect?: () => void
		oncreate?: () => void
	}

	let {
		isLoading,
		createUrl = '',
		createTitle = '',
		createIcon: CreateIcon = PlusIcon,
		onunselect,
		oncreate,
	}: Props = $props()
</script>

{#if isLoading}
	<div class="grid w-9 place-content-center" in:fade|local>
		<LoaderCircleIcon class="animate-spin text-primary" size={20} />
	</div>
{:else if createUrl}
	<a
		href={createUrl}
		class="btn btn-square btn-sm"
		in:fade|local={{ duration: 200 }}
		data-sveltekit-noscroll
		data-sveltekit-replacestate
		onclick={() => oncreate?.()}
		use:tip={{ content: createTitle }}
	>
		<CreateIcon size={20} />
	</a>
{/if}
