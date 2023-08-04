<script lang="ts">
	import type { ComponentProps } from 'svelte'
	import type { HTMLInputAttributes } from 'svelte/elements'
	import FormControl from './FormControl.svelte'

	type $$Props = ComponentProps<FormControl> & { input?: HTMLInputAttributes }
	$: ({ input, ...props } = $$props as $$Props)
</script>

<FormControl {...props} let:key>
	<input type="number" name="number_{key}" id="number_{key}" class="input-bordered input" {...input} />
</FormControl>
