<script lang="ts">
	import type { RemoteFormField } from '@sveltejs/kit'
	import { Issues, type Options, parseOptions } from 'fuma'

	/**
	 * Groupe de cases à cocher pour un champ `string[]`, sur le modèle de `InputRadio` de fuma:
	 * `field.as('checkbox', valeur)` nomme l'entrée `x[]`, que SvelteKit agrège en tableau.
	 * fuma 2 ne fournit pas cet input — son `InputSelectNative multiple` changerait l'apparence
	 * des champs de profil, qui sont déjà des cases à cocher.
	 */
	let {
		field,
		label,
		options: optionsProp,
		disabled,
		label_append,
	}: {
		field?: RemoteFormField<string[]>
		label: string
		options: Options
		disabled?: boolean
		label_append?: import('svelte').Snippet
	} = $props()

	const options = $derived(parseOptions(optionsProp))
</script>

<div class="flex flex-col gap-1">
	<div class="flex items-center px-3 text-sm">
		<span class="label">{label}</span>
		{@render label_append?.()}
	</div>
	<div class="join join-vertical">
		{#each options as option (option.value)}
			<label class="input join-item not-disabled:cursor-pointer not-disabled:hover:bg-base-200">
				<span>{option.label}</span>
				<input
					{...field?.as('checkbox', option.value)}
					class="checkbox checkbox-sm ml-auto"
					{disabled}
				/>
			</label>
		{/each}
	</div>
	<Issues {field} />
</div>
