<script lang="ts">
	import FormControl from './FormControl.svelte'
	import type { InputProps } from '.'
	import { bindValueWithParams } from './action'
	type $$Props = InputProps
	$: ({ input, value: _value, wrapperClass, bindWithParams, ...props } = $$props as $$Props)
	export let value = _value
	export let inputElement: HTMLInputElement | undefined = undefined

	$: ({ class: inputClass, ...inputProps } = input || {})
</script>

<FormControl {...props} enhanceDisabled={props.enhanceDisabled || bindWithParams} let:key>
	<slot name="label_append" slot="label_append" />

	<div class={wrapperClass}>
		<slot name="prepend" {value} />
		<input
			bind:value
			on:input
			on:focus
			on:blur
			on:keydown
			on:keyup
			bind:this={inputElement}
			use:bindValueWithParams={{ bindEnable: bindWithParams, initValue: (v) => (value = v) }}
			type="text"
			name={key}
			id={key}
			class="input-bordered input w-full {inputClass || ''}"
			{...inputProps}
		/>
		<slot name="append" {value} />
	</div>
</FormControl>
