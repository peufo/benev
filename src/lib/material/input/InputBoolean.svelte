<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import FormControl from './FormControl.svelte'
	import type { InputProps } from '.'
	import { bindCheckedWithParams } from './action'
	type $$Props = InputProps<boolean>
	$: ({ input, value: _value, bindWithParams, label, ...props } = $$props as $$Props)
	export let value = _value

	const dispatch = createEventDispatcher<{ change: boolean }>()
</script>

<FormControl {...props} let:key>
	<div class="flex items-center gap-2">
		<input type="hidden" name={key} value={value ? 'true' : ''} />
		<input
			bind:checked={value}
			use:bindCheckedWithParams={{ bindEnable: bindWithParams }}
			on:input={({ currentTarget: { checked } }) => dispatch('change', checked)}
			on:focus
			on:blur
			type="checkbox"
			id={key}
			class="checkbox"
			{...input}
		/>
		<label for={key} class="label cursor-pointer">
			<span class="label-text">
				<slot>{label}</slot>
			</span>
		</label>
	</div>
</FormControl>
