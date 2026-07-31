<script lang="ts">
	import type { Field } from '@prisma/client'
	import { untrack } from 'svelte'
	import { fade } from 'svelte/transition'
	import InputColor from './InputColor.svelte'
	import { getNextColor } from './InputColorPalette.svelte'

	interface Props {
		value: Record<string, string>
		field: Field | null
	}

	let { value = $bindable(), field }: Props = $props()

	let options = $derived(JSON.parse(field?.options || '[]') as string[])
	// Photo des options déjà traitées, comparée à `options` par l'effet ci-dessous.
	let currentOptions = $state(untrack(() => options))
	$effect.pre(() => {
		if (options !== currentOptions) {
			options.reduce((acc, cur) => ({ ...acc, [cur]: value[cur] || getNextColor() }), {})
			currentOptions = options
		}
	})
</script>

<!-- La remote function attend du JSON en clair: `zJson` le désérialise, là où `parseFormData`
     réclamait le jeton `USE_COERCE_JSON`. -->
<input type="hidden" name="colorMap" value={JSON.stringify(value)} />

{#if field?.type === 'select'}
	<div in:fade class="flex gap-1 flex-wrap justify-stretch max-w-80">
		{#each options as option (option)}
			<InputColor label={option} bind:value={value[option]} />
		{/each}
	</div>
{/if}
