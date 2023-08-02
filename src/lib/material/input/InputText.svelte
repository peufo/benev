<script lang="ts">
	import type { ComponentProps } from 'svelte'
	import FormControl from './FormControl.svelte'

	type $$Props = ComponentProps<FormControl>
	$: props = $$props as $$Props
</script>

<FormControl {...props} let:key>
	<input type="text" name={key} id={key} class="input-bordered input" />
</FormControl>
