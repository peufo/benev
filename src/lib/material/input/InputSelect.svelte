<script lang="ts">
	import SelectorList from './SelectorList.svelte'
	import { selector } from '$lib/action'
	import { DropDown, Icon } from '$lib/material'
	import { type Options, parseOptions } from '.'
	import { createEventDispatcher, onMount } from 'svelte'

	export let key = ''
	export let value = ''
	export let options: Options
	let klass = ''
	export { klass as class }
	export let btnClass = ''

	$: _options = parseOptions(options)
	$: selectedOption = _options.find((opt) => opt.value === value)

	let dropDown: DropDown
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

<div
	class={klass}
	use:selector={{
		focusIndex,
		onSelect,
		onFocus(index) {
			focusIndex = index
		},
	}}
	role="menu"
	tabindex="-1"
>
	<DropDown bind:this={dropDown}>
		<button slot="activator" type="button" class="btn w-full justify-start {btnClass}">
			{#if selectedOption}
				{#if selectedOption.icon}
					<Icon path={selectedOption.icon} />
				{/if}
				<span>{selectedOption.label}</span>
			{:else}
				<slot name="placeholder">Sélection</slot>
			{/if}
		</button>

		<SelectorList
			{focusIndex}
			items={_options.map((opt) => ({ id: opt.value, ...opt }))}
			let:item
			on:select={({ detail }) => onSelect(detail)}
			class="w-full"
		>
			{#if item.icon}
				<Icon path={item.icon} />
			{/if}
			<span class="whitespace-nowrap">{item.label}</span>
		</SelectorList>
	</DropDown>
</div>
