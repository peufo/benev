<script lang="ts">
	import FormControl from './FormControl.svelte'
	import type { InputProps } from '.'
	type $$Props = InputProps<boolean>
	$: ({ input, value: _value, ...props } = $$props as $$Props)
	export let value = _value

</script>

<FormControl {...props} prefix="boolean" let:key>
	<input
		bind:checked={value}
		on:input
		on:focus
		on:blur
		type="checkbox"
		name={key}
		id={key}
		class="toggle"
		{...input}
	/>
</FormControl>
