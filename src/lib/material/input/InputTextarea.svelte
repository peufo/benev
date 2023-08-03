<script lang="ts">
	import type { ComponentProps } from 'svelte'
	import FormControl from './FormControl.svelte'

	type $$Props = ComponentProps<FormControl>
	$: props = $$props as $$Props
</script>

<FormControl {...props} let:key>
	<textarea name={key} id={key} class="textarea textarea-bordered"></textarea>
</FormControl>
