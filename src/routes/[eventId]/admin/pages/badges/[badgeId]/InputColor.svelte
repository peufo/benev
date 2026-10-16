<script lang="ts">
	import type { RemoteFormField } from '$app/server'
	import { getTextColor } from '#lib/utils.js'

	interface Props {
		/** Champ du formulaire qui porte la couleur. Absent, le sélecteur ne soumet rien. */
		field?: RemoteFormField<string>
		label?: string
		/**
		 * Requise, et sans valeur de repli: lier `undefined` à un `$bindable` qui en porte une
		 * lève, et l'erreur interrompt le rendu de toute la page.
		 */
		value: string
	}

	let { field, label = '', value = $bindable() }: Props = $props()

	let input: HTMLInputElement = $state()!
</script>

<button
	type="button"
	style="background: {value}; color: {getTextColor(value)};"
	class="btn btn-sm"
	onclick={() => input.click()}
>
	<span class="lowercase">{label}</span>
	<!-- Le sélecteur reste lié à `value`, que le champ caché soumet: `field.as()` poserait sa
	     propre valeur sur l'input et se disputerait la liaison. -->
	{#if field}
		<input {...field.as('hidden', value)} />
	{/if}
	<input
		bind:value
		bind:this={input}
		type="color"
		list="palette"
		class="absolute invisible left-0 -bottom-1"
	/>
</button>
