<script lang="ts">
	import type { FocusEventHandler, FormEventHandler } from 'svelte/elements'
	import { FormControl, type InputProps } from '$lib/fuma/ui/input/index.js'

	type Props = InputProps & {
		autocomplete?: string
		// En mode runes le transfert d'événements passe par des props explicites.
		oninput?: FormEventHandler<HTMLInputElement>
		onfocus?: FocusEventHandler<HTMLInputElement>
		onblur?: FocusEventHandler<HTMLInputElement>
	}

	let {
		input,
		value = $bindable(),
		autocomplete = 'current-password',
		oninput,
		onfocus,
		onblur,
		...props
	}: Props = $props()
</script>

<FormControl {...props}>
	{#snippet children({ key })}
		<input
			bind:value
			{oninput}
			{onfocus}
			{onblur}
			type="password"
			name={key}
			id={key}
			class="input"
			{autocomplete}
			{...input}
		/>
	{/snippet}
</FormControl>
