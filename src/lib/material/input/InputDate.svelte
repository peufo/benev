<script lang="ts">
	import FormControl from './FormControl.svelte'
	import type {InputProps} from '.'
	type $$Props = InputProps
	$: ({ input, ...props } = $$props as $$Props)
	export let value = ''
</script>

<FormControl {...props} prefix="date" let:key>
	<input
		bind:value
		on:input
		on:focus
		on:blur
		type="datetime-local"
		name={key}
		id={key}
		class="input-bordered input"
		{...input}
	/>
</FormControl>
