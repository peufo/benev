<script lang="ts">
	import FormControl from './FormControl.svelte'
	import type { InputProps } from '.'

	type $$Props = InputProps<string[]> & { options: string[] }
	$: ({ input, value: _value, options: _1, class: klass, ...props } = $$props as $$Props)
	export let value = _value || []
	export let options: string[]
</script>

<input type="hidden" name={props.key} value={JSON.stringify(value)}>

<div class={klass}>
	<div class="label">
		<span class="label-text">{props.label}</span>
	</div>

	{#each options as option, index} 
		<FormControl
			{...props}
			let:key
			label={option}
			prefix="ignored"
			prefixFor={index}
			class="flex-row-reverse justify-end items-center gap-2"
		>
			<input
				bind:group={value}
				on:input
				on:focus
				on:blur
				value={option}
				type="checkbox"
				name={key}
				id="{index}{key}"
				class="checkbox"
				{...input}
			/>
		</FormControl>
	{/each}
</div>
