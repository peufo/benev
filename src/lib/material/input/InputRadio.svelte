<script lang="ts">
	import FormControl from './FormControl.svelte'
	import type { InputProps } from '.'
	type $$Props = InputProps<boolean> & { options: Record<string, string> }
	$: ({ input, value: _value, options: _options, class: klass, ...props } = $$props as $$Props)
	export let value = _value
	export let options: Record<string, string>
</script>

<div class={klass}>
	<span class="label-text px-1 py-2">{props.label}</span>

	{#each Object.entries(options) as [v, label]}
		<FormControl
			{...props}
			let:key
			{label}
			prefixFor={v}
			class="flex-row-reverse justify-end items-center gap-2"
		>
			<input
				bind:group={value}
				on:input
				on:focus
				on:blur
				value={v}
				type="radio"
				name={key}
				id="{v}{key}"
				class="radio"
				{...input}
			/>
		</FormControl>
	{/each}
</div>
