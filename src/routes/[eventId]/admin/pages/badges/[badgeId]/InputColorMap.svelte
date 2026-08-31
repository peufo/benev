<script lang="ts">
	import type { Field } from '@prisma/client'
	import { untrack } from 'svelte'
	import { fade } from 'svelte/transition'
	import InputColor from './InputColor.svelte'
	import { getNextColor } from './InputColorPalette.svelte'

	interface Props {
		value: Record<string, string>
		field: Field | null
		/**
		 * L'attribution d'une couleur à une nouvelle option est écrite par du code: aucun
		 * évènement de formulaire ne l'annonce, et la barre de sauvegarde ne la verrait pas.
		 */
		onchange?: () => void
	}

	let { value = $bindable(), field, onchange }: Props = $props()

	let options = $derived(JSON.parse(field?.options || '[]') as string[])
	// Photo des options déjà traitées. Comparée par contenu: le champ change d'identité à
	// chaque rechargement des données, sans que ses options aient bougé.
	let currentOptions = $state(untrack(() => options))
	$effect.pre(() => {
		if (options.join('\n') === currentOptions.join('\n')) return
		currentOptions = options
		// Chaque option doit porter une couleur, sans quoi le nuancier en affiche une que le
		// badge n'utilise pas. Les options disparues laissent la leur derrière elles.
		value = Object.fromEntries(options.map((option) => [option, value[option] || getNextColor()]))
		onchange?.()
	})
</script>

<!-- La remote function attend du JSON en clair: `zJson` le désérialise, là où `parseFormData`
     réclamait le jeton `USE_COERCE_JSON`. -->
<input type="hidden" name="colorMap" value={JSON.stringify(value)} />

{#if field?.type === 'select'}
	<div in:fade class="flex flex-wrap gap-1">
		{#each options as option (option)}
			<InputColor label={option} bind:value={value[option]} />
		{/each}
	</div>
{/if}
