<script lang="ts">
	import SelectorList from './SelectorList.svelte'
	import { selector } from '$lib/action'
	import { Icon } from '$lib/material'
	import { debounce } from '$lib/debounce'


	type Option = { label: string; icon?: string }

  export let key = ''
  export let value = ''
  export let placeholder = 'Selection'
	export let options: Record<string, Option>

	let selectorList: SelectorList<Option & { id: string }>
	let focusIndex = 0

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
		on:click|preventDefault={() => selectorList.open()}
		on:focus={() => selectorList.open()}
		on:blur={handleLeave}
		class="btn w-full justify-start"
	>
    {#if options[value]}
      {@const item = options[value]}
      {#if item.icon}
        <Icon path={item.icon} />
      {/if}
      <span>{item.label}</span>
    {:else}
      {placeholder}
    {/if}
	</button>

	<SelectorList
		bind:this={selectorList}
		{focusIndex}
		items={Object.entries(options).map(([id, v]) => ({ id, ...v }))}
		let:item
    on:select={({detail}) => onSelect(detail)}
	>
		{#if item.icon}
			<Icon path={item.icon} />
		{/if}
		<span>{item.label}</span>
	</SelectorList>
</div>
