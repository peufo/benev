<script lang="ts">
	import SelectorList from './SelectorList.svelte'
	import { DropDown, Icon } from '$lib/material'
	import { type Options, parseOptions } from '.'
	import { createEventDispatcher, onMount } from 'svelte'

	export let key = ''
	export let value = ''
	export let options: Options
	export let noBtnClass = false
	let klass = ''
	export { klass as class }

	$: _options = parseOptions(options)
	$: selectedOption = _options.find((opt) => opt.value === value)

	let dropDown: DropDown
	let button: HTMLButtonElement
	const dispatch = createEventDispatcher<{ select: string }>()

	let focusIndex = 0
	onMount(() => {
		const index = _options.findIndex((opt) => opt.value === value)
		focusIndex = index === -1 ? 0 : index
	})

	function onSelect(index: number) {
		focusIndex = index
		value = _options[index].value
		dispatch('select', value)
		dropDown.hide()
	}
</script>

<input type="hidden" name={key} {value} />

<DropDown bind:this={dropDown}>
	<button bind:this={button} slot="activator" type="button" class:btn={!noBtnClass} class={klass}>
		<slot name="btn">
			{#if selectedOption}
				{#if selectedOption.icon}
					<Icon path={selectedOption.icon} size={21} class="opacity-70" />
				{/if}
				<span>{selectedOption.label}</span>
			{:else}
				<slot name="placeholder">Sélection</slot>
			{/if}
		</slot>
	</button>

	<SelectorList
		trigger={button}
		{focusIndex}
		items={_options.map((opt) => ({ id: opt.value, ...opt }))}
		let:item
		on:select={({ detail }) => onSelect(detail)}
		class="w-full"
	>
		{#if item.icon}
			<Icon path={item.icon} size={21} class="opacity-70" />
		{/if}
		<span class="whitespace-nowrap">{item.label}</span>
	</SelectorList>
</DropDown>
