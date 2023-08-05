<script lang="ts">
	import FormControl from './FormControl.svelte'
	import type {InputProps} from '.'
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
		type="datetime-local"
		name="date_{key}"
		id="date_{key}"
		class="input-bordered input"
		{...input}
	/>
</FormControl>
