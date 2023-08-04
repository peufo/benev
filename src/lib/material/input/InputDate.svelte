<script lang="ts">
	import type { ComponentProps } from 'svelte'
	import type { HTMLInputAttributes } from 'svelte/elements'
	import FormControl from './FormControl.svelte'

	type $$Props = ComponentProps<FormControl> & {input?: HTMLInputAttributes}
	$: ({input, ...props} = $$props as $$Props)
</script>

<FormControl {...props} let:key>
	<input
		type="datetime-local"
		name="date_{key}"
		id="date_{key}"
		class="input-bordered input"
		{...input}
	/>
</FormControl>
