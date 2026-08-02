<script lang="ts">
	import { ChevronsUpDownIcon } from '@lucide/svelte'
	import { onMount } from 'svelte'

	import { DropDown } from 'fuma'
	import { SelectorList, FormControl, type InputProps } from '$lib/ui'

	import { type Options, parseOptions } from 'fuma'
	import type { TippyProps } from 'fuma'

	type Props = Omit<InputProps, 'input' | 'inputElement'> & {
		options: Options
		tippyProps?: TippyProps
		placeholder?: string
		/** Remplacent les évènements `input` et `select` de la version Svelte 4. */
		oninput?: (value: string) => void
		onselect?: (value: string) => void
	}

	let {
		value = $bindable(),
		options,
		tippyProps,
		placeholder,
		oninput,
		onselect,
		...props
	}: Props = $props()

	let _options = $derived(parseOptions(options))
	let selectedOption = $derived(_options.find((opt) => opt.value === value))

	let dropDown: DropDown
	let button: HTMLButtonElement | undefined = $state()!

	let focusIndex = $state(0)
	onMount(() => {
		const index = _options.findIndex((opt) => opt.value === value)
		focusIndex = index === -1 ? 0 : index
	})

	function onSelect(index: number) {
		focusIndex = index
		value = _options[index].value
		oninput?.(value)
		onselect?.(value)
		dropDown.hide()
	}
</script>

<DropDown bind:this={dropDown}>
	{#snippet activator()}
		<FormControl {...props}>
			{#snippet children({ key })}
				<button
					bind:this={button}
					id={key}
					type="button"
					class="flex h-12 items-center gap-2 rounded-lg border pl-4 pr-2 hover:bg-base-200/50"
				>
					{#if selectedOption}
						{@const SelectedIcon = selectedOption.icon}
						{#if SelectedIcon}
							<SelectedIcon size={21} class="opacity-70" />
						{/if}
						<span>{selectedOption.label}</span>
					{:else if placeholder}
						<span class="opacity-60">{placeholder}</span>
					{/if}
					<ChevronsUpDownIcon class="ml-auto" size={18} />
				</button>
				{#if value !== undefined}
					<input type="hidden" name={key} {value} />
				{/if}
			{/snippet}
		</FormControl>
	{/snippet}

	<SelectorList
		trigger={button}
		{focusIndex}
		items={_options.map((opt) => ({ id: opt.value, ...opt }))}
		onSelect={(index) => onSelect(index)}
		class="w-full"
	>
		{#snippet children({ item })}
			{@const ItemIcon = item.icon}
			{#if ItemIcon}
				<ItemIcon size={18} class="opacity-70" />
			{/if}
			<span class="whitespace-nowrap pr-4">{item.label}</span>
		{/snippet}
	</SelectorList>
</DropDown>
