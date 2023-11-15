<script lang="ts">
	import FormControl from './FormControl.svelte'
	import type { InputProps } from '.'
	type $$Props = InputProps
	$: ({ input, value: _value, ...props } = $$props as $$Props)
	export let value = _value
</script>

<FormControl {...props} let:key>
	{#if value}
		<input type="hidden" name={key} value={new Date(value).toJSON()} />
	{/if}
	<input
		bind:value
		on:input
		on:focus
		on:blur
		type="datetime-local"
		id={key}
		class="input-bordered input"
		{...input}
	/>
</FormControl>
