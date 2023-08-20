<script lang="ts">
	import FormControl from './FormControl.svelte'
	import type { InputProps } from '.'
	type $$Props = InputProps
	$: ({ input, value: _value, ...props } = $$props as $$Props)
	export let value = _value
	export let inputElement: HTMLInputElement | undefined = undefined

	$: ({ class: inputClass, ...inputProps } = input || {})
</script>

<FormControl {...props} let:key>
	<input
		bind:value
		on:input
		on:focus
		on:blur
		bind:this={inputElement}
		type="text"
		name={key}
		id={key}
		class="input-bordered input {inputClass || ''}"
		{...inputProps}
	/>
	<slot name="append"/>
</FormControl>
