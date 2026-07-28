<script lang="ts">
	import { createBubbler } from 'svelte/legacy'

	const bubble = createBubbler()
	import { USE_COERCE_NUMBER } from 'fuma'
	import { FormControl, type InputProps } from '$lib/fuma-legacy/ui/input/index.js'
	import type { HTMLInputAttributes } from 'svelte/elements'

	type $$Props = InputProps<number>

	interface Props {
		value?: number | null | undefined
		input?: HTMLInputAttributes | undefined
		inputElement?: HTMLInputElement | undefined
		label_append?: import('svelte').Snippet
		[key: string]: any
	}

	let {
		value = $bindable(undefined),
		input = undefined,
		inputElement = $bindable(undefined),
		label_append,
		...rest
	}: Props = $props()

	const label_append_render = $derived(label_append)
</script>

<FormControl {...rest}>
	{#snippet label_append()}
		{@render label_append_render?.()}
	{/snippet}
	{#snippet children({ key })}
		<input
			bind:value
			bind:this={inputElement}
			oninput={bubble('input')}
			onfocus={bubble('focus')}
			onblur={bubble('blur')}
			type="number"
			id={key}
			inputmode="numeric"
			class="input"
			{...input}
		/>
		{#if value !== undefined}
			<input type="hidden" name={key} value="{USE_COERCE_NUMBER}{value}" />
		{/if}
	{/snippet}
</FormControl>
