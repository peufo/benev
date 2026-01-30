<script lang="ts">
	import type { Field } from '@prisma/client'
	import { fade } from 'svelte/transition'
	import InputColor from './InputColor.svelte'
	import { getNextColor } from './InputColorPalette.svelte'
	import { USE_COERCE_JSON } from 'fuma'

	export let value: Record<string, string>
	export let field: Field | null

	$: options = JSON.parse(field?.options || '[]') as string[]
	let currentOptions = options
	$: {
		if (options !== currentOptions) {
			options.reduce((acc, cur) => ({ ...acc, [cur]: value[cur] || getNextColor() }), {})
			currentOptions = options
		}
	}
</script>

<input type="hidden" name="colorMap" value="{USE_COERCE_JSON}{JSON.stringify(value)}" />

{#if field?.type === 'select'}
	<div in:fade class="flex gap-1 flex-wrap justify-stretch max-w-80">
		{#each options as option}
			<InputColor label={option} bind:value={value[option]} />
		{/each}
	</div>
{/if}
