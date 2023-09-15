<script lang="ts">
	import FormControl from './FormControl.svelte'
	import { type InputProps, type Options, parseOptions } from '.'
	import { slide } from 'svelte/transition'

	type $$Props = InputProps<string[]> & { options: Options; checkboxesClass?: string }
	$: ({
		input,
		value: _value,
		options: _1,
		class: klass,
		checkboxesClass,
		hint,
		error,
		...props
	} = $$props as $$Props)
	export let value = _value || []
	export let options: Options

	$: _options = parseOptions(options)
</script>

<input type="hidden" name={props.key} value={JSON.stringify(value)} />

<div class={klass}>
	<div class="label">
		<span class="label-text">{props.label}</span>
		<slot name="label_append" />
	</div>

	<div class={checkboxesClass}>
		{#each _options as option, index}
			<FormControl
				{...props}
				let:key
				label={option.label}
				prefix="ignored"
				prefixFor={index}
				class="flex-row-reverse justify-end items-center gap-2"
			>
				<input
					bind:group={value}
					on:change
					on:input
					on:focus
					on:blur
					value={option.value}
					type="checkbox"
					name={key}
					id="{index}{key}"
					class="checkbox"
					{...input}
				/>
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
