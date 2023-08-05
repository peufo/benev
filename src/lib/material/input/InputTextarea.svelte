<script lang="ts">
	import FormControl from './FormControl.svelte'
	import type { TextareaProps } from '.'
	type $$Props = TextareaProps
	$: ({ textarea, ...props } = $$props as $$Props)
	export let value = ''
</script>

<FormControl {...props} let:key>
	<textarea
		bind:value
		on:input
		on:focus
		on:blur
		name={key}
		id={key}
		class="textarea textarea-bordered"
		{...textarea}
	/>
</FormControl>
