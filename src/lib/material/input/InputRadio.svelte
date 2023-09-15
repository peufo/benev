<script lang="ts">
	import FormControl from './FormControl.svelte'
	import { type InputProps, type Options, parseOptions } from '.'
	import { bindValueWithParams } from './action'
	import { slide } from 'svelte/transition'
	type $$Props = InputProps & { options: Options }
	$: ({ input, value: _value, options, hint, error, class: klass, ...props } = $$props as $$Props)
	export let value = _value

	$: _options = parseOptions(options)
</script>

<div class={klass}>
	<div class="label">
		<span class="label-text">{props.label}</span>
		<slot name="label_append" />
	</div>

	{#each _options as option}
		<FormControl
			{...props}
			let:key
			label={option.label}
			prefixFor={option.value}
			class="flex-row-reverse justify-end items-center gap-2"
		>
			<input
				use:bindValueWithParams={{ bindEnable: props.bindWithParams }}
				bind:group={value}
				on:input
				on:focus
				on:blur
				value={option.value}
				type="radio"
				name={key}
				id="{option.value}{key}"
				class="radio"
				{...input}
			/>
		</FormControl>
	{/each}

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
