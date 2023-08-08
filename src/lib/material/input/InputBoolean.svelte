<script lang="ts">
	import FormControl from './FormControl.svelte'
	import type { InputProps } from '.'
	type $$Props = InputProps<boolean>
	$: ({ input, ...props } = $$props as $$Props)
	export let value = false

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
		class="checkbox"
		{...input}
	/>
</FormControl>
