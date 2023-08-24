<script lang="ts">
	import SelectorList from './SelectorList.svelte'
	import { selector } from '$lib/action'
	import { Icon } from '$lib/material'
	import { debounce } from '$lib/debounce'
	import {type Options,type Option, parseOptions} from '.'
	import { onMount } from 'svelte'

  export let key = ''
  export let value = ''
  export let placeholder = 'Selection'
	export let options: Options

	$: _options = parseOptions(options)
	$: selectedOption = _options.find(opt => opt.value === value)

	let selectorList: SelectorList<Option & { id: string }>
	let focusIndex = 0 
	onMount(() => {
		const index = _options.findIndex(opt => opt.value === value)
		focusIndex = index === -1 ? 0 : index
	})

	function onSelect(index: number) {
		focusIndex = index
		value = Object.keys(options)[index]
    selectorList.close()
	}

	const handleLeave = debounce(() => {
		selectorList.close()
	}, 300)
</script>

<input type="hidden" name={key} {value}>

<div
	class="relative"
	use:selector={{
		focusIndex,
		onSelect,
		onFocus(index) {
			focusIndex = index
		},
	}}
	on:mouseenter={handleLeave.clear}
	on:mouseleave={handleLeave}
	role="menu"
	tabindex="-1"
>
	<button
		type="button"
		on:click={() => selectorList.open()}
		on:focus={() => selectorList.open()}
		on:blur={handleLeave}
		class="btn w-full justify-start"
	>
    {#if selectedOption}
      {#if selectedOption.icon}
        <Icon path={selectedOption.icon} />
      {/if}
      <span>{selectedOption.label}</span>
    {:else}
      {placeholder}
    {/if}
	</button>

	<SelectorList
		bind:this={selectorList}
		{focusIndex}
		items={_options.map(opt => ({id: opt.value, ...opt}))}
		let:item
    on:select={({detail}) => onSelect(detail)}
	>
		{#if item.icon}
			<Icon path={item.icon} />
		{/if}
		<span>{item.label}</span>
	</SelectorList>
</div>
