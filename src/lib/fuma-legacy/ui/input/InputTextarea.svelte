<script lang="ts">
	import type { Snippet } from 'svelte'
	import type { FocusEventHandler, FormEventHandler } from 'svelte/elements'
	import { FormControl, type TextareaProps } from '$lib/fuma-legacy/ui/input/index.js'

	type Props = TextareaProps & {
		// En mode runes le transfert d'événements passe par des props explicites.
		oninput?: FormEventHandler<HTMLTextAreaElement>
		onfocus?: FocusEventHandler<HTMLTextAreaElement>
		onblur?: FocusEventHandler<HTMLTextAreaElement>
		label_append?: Snippet
	}

	let {
		textarea,
		value = $bindable(),
		oninput,
		onfocus,
		onblur,
		label_append,
		...props
	}: Props = $props()

	let inputClass = $derived(textarea?.class)
	let inputProps = $derived.by(() => {
		const { class: _class, ...rest } = textarea || {}
		return rest
	})
</script>

<FormControl {...props} {label_append}>
	{#snippet children({ key })}
		<textarea
			bind:value
			{oninput}
			{onfocus}
			{onblur}
			name={key}
			id={key}
			class="textarea {inputClass || ''}"
			rows="4"
			{...inputProps}></textarea>
	{/snippet}
</FormControl>
