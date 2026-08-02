<script lang="ts">
	import { ChevronsUpDownIcon } from '@lucide/svelte'
	import { DropDown } from 'fuma'
	import { SelectorList } from '$lib/ui'
	import { type Options, parseOptions } from 'fuma'
	import type { TippyProps } from 'fuma'

	interface Props {
		options: Options
		tippyProps?: Partial<TippyProps>
		children?: import('svelte').Snippet
		/** Remplacent les évènements de la version Svelte 4. */
		onselect?: (value: string) => void
	}

	let { options, tippyProps = {}, children, onselect }: Props = $props()

	let _options = $derived(parseOptions(options))

	let trigger: HTMLDivElement = $state()!

	let dropDown: DropDown = $state()!

	function onSelect(index: number) {
		const option = _options[index]
		onselect?.(option.value)
		dropDown.hide()
	}
</script>

<DropDown bind:this={dropDown} {tippyProps}>
	{#snippet activator()}
		<div class="contents" bind:this={trigger}>
			{#if children}{@render children()}{:else}
				<button type="button" class="flex h-12 items-center gap-2 rounded-lg border pl-4 pr-2">
					<span>Menu</span>
					<ChevronsUpDownIcon class="ml-auto" size={18} />
				</button>
			{/if}
		</div>
	{/snippet}

	<SelectorList
		{trigger}
		items={_options.map((opt) => ({ id: opt.value, ...opt }))}
		{onSelect}
		class="w-full"
	>
		{#snippet children({ item })}
			{@const ItemIcon = item.icon}
			{#if item.icon}
				<ItemIcon size={18} class="opacity-70" />
			{/if}
			<span class="whitespace-nowrap pr-4">{item.label}</span>
		{/snippet}
	</SelectorList>
</DropDown>
