<script lang="ts">
	import type { ComponentProps } from 'svelte'
	import type { HTMLInputAttributes } from 'svelte/elements'
	import FormControl from './FormControl.svelte'

	type $$Props = ComponentProps<FormControl> & { input?: HTMLInputAttributes; value?: string }
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
