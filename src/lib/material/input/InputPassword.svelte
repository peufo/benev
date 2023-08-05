<script lang="ts">
	import FormControl from './FormControl.svelte'
	import type { InputProps } from '.'
	type $$Props = InputProps
	$: ({ input, ...props } = $$props as $$Props)
	export let value = ''
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
		autocomplete="current-password"
		{...input}
	/>
</FormControl>
