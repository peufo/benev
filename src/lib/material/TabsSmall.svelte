<script lang="ts">
	import { Icon, parseOptions, type Options } from '$lib/material'
	import { createEventDispatcher } from 'svelte'

	export let options: Options
	export let activeValue: string | undefined
	export let showLabel = false
	$: _options = parseOptions(options)

	const dispatch = createEventDispatcher<{ click: string }>()
</script>

<div class="flex items-center rounded-lg gap-[3px] p-1 bg-base-200">
	{#each _options as { value, label, icon }}
		{@const isActive = activeValue === value}
		<button
			on:click={() => dispatch('click', value)}
			class="h-6 p-1 flex items-center justify-center gap-2 rounded"
			class:px-2={showLabel}
			class:w-6={icon && !showLabel}
			class:whitespace-nowrap={showLabel}
			class:bg-base-100={isActive}
			class:shadow={isActive}
		>
			{#if icon}
				<Icon
					path={icon}
					title={showLabel ? '' : label}
					size={18}
					class={isActive ? '' : 'opacity-60'}
				/>
			{/if}
			{#if !icon || showLabel}
				<span class="text-sm font-medium opacity-80">{label}</span>
			{/if}
		</button>
	{/each}
</div>
