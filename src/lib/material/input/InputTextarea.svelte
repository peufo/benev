<script lang="ts">
	import FormControl from './FormControl.svelte'
	import type { TextareaProps } from '.'
	type $$Props = TextareaProps
	$: ({ textarea, value: _value, ...props } = $$props as $$Props)
	export let value = _value
</script>

<FormControl {...props} let:key>
	<slot name="label_append" slot="label_append" />
	<textarea
		bind:value
		on:input
		on:focus
		on:blur
		name={key}
		id={key}
		class="textarea textarea-bordered"
		rows="4"
		{...textarea}
	/>
</FormControl>
