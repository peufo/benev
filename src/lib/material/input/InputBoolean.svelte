<script lang="ts">
	import FormControl from './FormControl.svelte'
	import type { InputProps } from '.'
	import { bindCheckedWithParams } from './action'
	type $$Props = InputProps<boolean>
	$: ({ input, value: _value, bindWithParams, ...props } = $$props as $$Props)
	export let value = _value
</script>

<FormControl
	{...props}
	let:key
	class="flex-row-reverse justify-end items-center gap-2 {props.class}"
>
	<slot name="label_append" slot="label_append" />
	<input type="hidden" name={key} value={value ? 'true' : ''} />
	<input
		bind:checked={value}
		use:bindCheckedWithParams={{ bindEnable: bindWithParams }}
		on:input
		on:focus
		on:blur
		type="checkbox"
		id={key}
		class="checkbox"
		{...input}
	/>
</FormControl>
