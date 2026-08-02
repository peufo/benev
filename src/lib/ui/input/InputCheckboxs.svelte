<script lang="ts">
	import type { Snippet } from 'svelte'
	import { slide } from 'svelte/transition'
	import { FormControl, type InputProps } from '$lib/ui'
	import { type Options, parseOptions } from 'fuma'

	type Props = InputProps<string[]> & {
		options: Options
		checkboxesClass?: string
		label_append?: Snippet
	}

	let {
		input,
		value = $bindable([]),
		options,
		class: klass,
		checkboxesClass,
		hint,
		error,
		label_append,
		...props
	}: Props = $props()

	if (!value) value = []

	let _options = $derived(parseOptions(options))
</script>

<div class={klass}>
	{#if props.label}
		<div class="label">
			<span class="label-text">{props.label}</span>
			{@render label_append?.()}
		</div>
	{/if}

	<div class={checkboxesClass}>
		{#each _options as option, index (option.value)}
			<FormControl
				{...props}
				label={option.label}
				prefixFor={index}
				class="flex-row-reverse items-center justify-end gap-2"
			>
				{#snippet children({ key })}
					<input
						bind:group={value}
						value={option.value}
						type="checkbox"
						name={key}
						id="{index}{key}"
						class="checkbox"
						{...input}
					/>
				{/snippet}
			</FormControl>
		{/each}
	</div>

	{#if error}
		<div class="label" transition:slide>
			<span class="label-text-alt text-warning">{error}</span>
		</div>
	{:else if hint}
		<div class="label" transition:slide>
			<span class="label-text-alt text-info">{hint}</span>
		</div>
	{/if}
</div>

<input type="hidden" name={props.key} value={JSON.stringify(value)} />
