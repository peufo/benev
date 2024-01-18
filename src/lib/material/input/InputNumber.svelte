<script lang="ts">
	import FormControl from './FormControl.svelte'
	import type { InputProps } from '.'
	type $$Props = InputProps
	$: ({ input, value: _value, ...props } = $$props as $$Props)
	export let value = _value
</script>

<FormControl {...props} let:key>
	<slot name="label_append" slot="label_append" />
	<input
		bind:value
		bind:this={props.inputElement}
		on:input
		on:focus
		on:blur
		type="number"
		name={key}
		id={key}
		class="input-bordered input"
		inputmode="numeric"
		{...input}
	/>
</FormControl>
