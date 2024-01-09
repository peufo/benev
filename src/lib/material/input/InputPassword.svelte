<script lang="ts">
	import FormControl from './FormControl.svelte'
	import type { InputProps } from '.'
	type $$Props = InputProps & { autocomplete?: string }
	$: ({ input, value: _value, ...props } = $$props as $$Props)
	export let value = _value
	export let autocomplete = 'current-password'
</script>

<FormControl {...props} let:key>
	<input
		bind:value
		on:input
		on:focus
		on:blur
		type="password"
		name={key}
		id={key}
		class="input-bordered input"
		{autocomplete}
		{...input}
	/>
</FormControl>
