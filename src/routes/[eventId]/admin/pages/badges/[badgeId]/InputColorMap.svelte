<script lang="ts">
	import type { Field } from '@prisma/client'
	import { fade } from 'svelte/transition'
	import InputColor from './InputColor.svelte'
	import { paletteColor } from './InputColorPalette.svelte'

	interface Props {
		value: Record<string, string>
		field: Field | null
	}

	let { value = $bindable(), field }: Props = $props()

	let options = $derived(JSON.parse(field?.options || '[]') as string[])

	/**
	 * Chaque option doit porter une couleur, sans quoi le nuancier en afficherait une que le
	 * badge n'utilise pas. Elle se dérive plutôt qu'elle ne s'écrive dans un `$effect.pre`: le
	 * bloc qui la rend s'exécute avant lui, et `InputColor` lèverait sur la couleur manquante.
	 * Les options disparues laissent la leur derrière elles.
	 */
	const colorMap = $derived({
		...value,
		...Object.fromEntries(options.map((option, i) => [option, value[option] || paletteColor(i)])),
	})
</script>

<!-- La remote function attend du JSON en clair: `zJson` le désérialise, là où `parseFormData`
     réclamait le jeton `USE_COERCE_JSON`. -->
<input type="hidden" name="colorMap" value={JSON.stringify(colorMap)} />

{#if field?.type === 'select'}
	<div in:fade class="flex flex-wrap gap-1">
		{#each options as option (option)}
			<!-- Liaison par accesseurs: la couleur choisie rejoint le nuancier enregistré, d'où
			     la dérivation la relit. -->
			<InputColor
				label={option}
				bind:value={() => colorMap[option], (color) => (value = { ...colorMap, [option]: color })}
			/>
		{/each}
	</div>
{/if}
