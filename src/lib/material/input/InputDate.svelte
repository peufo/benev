<script lang="ts">
	import dayjs from 'dayjs'

	import type { FormEventHandler } from 'svelte/elements'
	import FormControl from './FormControl.svelte'
	import type { InputProps } from '.'
	import { createEventDispatcher } from 'svelte'
	type $$Props = InputProps<Date | null>
	$: ({ input, value: _value, ...props } = $$props as $$Props)
	export let value = _value

	const dispatch = createEventDispatcher<{ input: Date | null }>()

	const handleInput: FormEventHandler<HTMLInputElement> = ({ currentTarget }) => {
		value = currentTarget.valueAsDate || null
		dispatch('input', value)
	}
</script>

<FormControl {...props} let:key>
	<input
		value={value && dayjs(value).format('YYYY-MM-DD')}
		on:input={handleInput}
		on:focus
		on:blur
		type="date"
		name={key}
		id={key}
		class="input-bordered input"
		{...input}
	/>
</FormControl>
