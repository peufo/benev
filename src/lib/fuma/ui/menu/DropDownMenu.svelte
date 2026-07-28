<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import { mdiUnfoldMoreHorizontal } from '@mdi/js'

	import { Icon } from '$lib/fuma/ui/icon/index.js'
	import { DropDown } from '$lib/fuma/ui/menu/index.js'
	import { SelectorList } from '$lib/fuma/ui/input/index.js'
	import { type Options, parseOptions } from '$lib/fuma/utils/options.js'
	import type { TippyProps } from '$lib/fuma/utils/tippy.js'

	interface Props {
		options: Options;
		tippyProps?: Partial<TippyProps>;
		children?: import('svelte').Snippet;
	}

	let { options, tippyProps = {}, children }: Props = $props();

	let _options = $derived(parseOptions(options))

	let trigger: HTMLDivElement = $state()

	let dropDown: DropDown = $state()
	const dispatch = createEventDispatcher<{ select: string }>()

	function onSelect(index: number) {
		const option = _options[index]
		dispatch('select', option.value)
		dropDown.hide()
	}
</script>

<DropDown bind:this={dropDown} {tippyProps}>
	{#snippet activator()}
		<div class="contents" bind:this={trigger} >
			{#if children}{@render children()}{:else}
				<button type="button" class="flex h-12 items-center gap-2 rounded-lg border pl-4 pr-2">
					<span>Menu</span>
					<Icon class="ml-auto" path={mdiUnfoldMoreHorizontal} size={18} />
				</button>
			{/if}
		</div>
	{/snippet}

	<SelectorList
		{trigger}
		items={_options.map((opt) => ({ id: opt.value, ...opt }))}
		
		on:select={({ detail }) => onSelect(detail)}
		class="w-full"
	>
		{#snippet children({ item })}
				{#if item.icon}
				<Icon path={item.icon} size={18} class="opacity-70" />
			{/if}
			<span class="whitespace-nowrap pr-4">{item.label}</span>
					{/snippet}
		</SelectorList>
</DropDown>
