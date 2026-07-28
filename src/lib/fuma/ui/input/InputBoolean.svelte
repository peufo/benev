<script lang="ts">
	import { createBubbler } from 'svelte/legacy';

	const bubble = createBubbler();
	import { createEventDispatcher } from 'svelte'
	import type { HTMLInputAttributes } from 'svelte/elements'
	import { FormControl, type InputProps, bindCheckedWithParams } from '$lib/fuma/ui/input/index.js'
	import { USE_COERCE_BOOLEAN } from '$lib/fuma/utils/constant.js'

	type $$Props = InputProps<boolean> & { isRow?: boolean }
	interface Props {
		value?: boolean | null | undefined;
		input?: HTMLInputAttributes;
		inputElement?: HTMLInputElement | undefined;
		bindWithParams?: boolean;
		[key: string]: any
	}

	let {
		value = $bindable(false),
		input = {},
		inputElement = $bindable(undefined),
		bindWithParams = false,
		...rest
	}: Props = $props();

	const dispatch = createEventDispatcher<{ change: boolean }>()
</script>

<FormControl {...rest}  class="">
	{#snippet children({ key })}
		<input
			bind:this={inputElement}
			bind:checked={value}
			use:bindCheckedWithParams={{ bindEnable: bindWithParams }}
			oninput={({ currentTarget: { checked } }) => dispatch('change', checked)}
			onfocus={bubble('focus')}
			onblur={bubble('blur')}
			type="checkbox"
			id={key}
			class="checkbox ml-1"
			{...input}
		/>

		<input type="hidden" name={key} value="{USE_COERCE_BOOLEAN}{value}" />
	{/snippet}
</FormControl>
