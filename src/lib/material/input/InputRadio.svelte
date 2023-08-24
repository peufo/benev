<script lang="ts">
	import FormControl from './FormControl.svelte'
	import { type InputProps, type Options, parseOptions } from '.'
	import { bindValueWithParams } from './action'
	type $$Props = InputProps & { options: Options }
	$: ({ input, value: _value, options, class: klass, ...props } = $$props as $$Props)
	export let value = _value

	$: _options = parseOptions(options)
</script>

<div class={klass}>
	<div class="label">
		<span class="label-text">{props.label}</span>
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
</div>
