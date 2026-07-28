<script lang="ts">
	import { createBubbler } from 'svelte/legacy';

	const bubble = createBubbler();
	import { createEventDispatcher } from 'svelte'
	import type { FormEventHandler, HTMLInputAttributes } from 'svelte/elements'
	import dayjs from 'dayjs'

	import { FormControl, type InputProps } from '$lib/fuma/ui/input/index.js'
	import { USE_COERCE_DATE } from '$lib/fuma/utils/constant.js'

	type $$Props = InputProps<Date | null | undefined>
	interface Props {
		value?: Date | null | undefined;
		input?: HTMLInputAttributes;
		[key: string]: any
	}

	let { value = $bindable(undefined), input = {}, ...rest }: Props = $props();
	let { class: inputClass = '', ...inputProps } = $derived(input)

	const dispatch = createEventDispatcher<{ input: Date | null }>()

	const handleInput: FormEventHandler<HTMLInputElement> = ({ currentTarget }) => {
		const newValue = currentTarget.valueAsDate
		if (newValue === null) value = null
		newValue?.setHours(value?.getHours() || 0, value?.getMinutes() || 0, value?.getSeconds() || 0)
		value = newValue
		dispatch('input', value)
	}
</script>

<FormControl {...rest} >
	{#snippet children({ key })}
		<input
			value={value && dayjs(value).format('YYYY-MM-DD')}
			oninput={handleInput}
			onfocus={bubble('focus')}
			onblur={bubble('blur')}
			type="date"
			id={key}
			class="input input-bordered {inputClass}"
			{...inputProps}
		/>

		<input type="hidden" name={key} value="{USE_COERCE_DATE}{value?.toJSON()}" />
	{/snippet}
</FormControl>
