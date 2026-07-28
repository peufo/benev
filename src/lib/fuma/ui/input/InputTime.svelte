<script lang="ts">
	import { createBubbler } from 'svelte/legacy'

	const bubble = createBubbler()
	import { createEventDispatcher } from 'svelte'
	import type { HTMLInputAttributes, FormEventHandler } from 'svelte/elements'
	import { FormControl, type InputProps } from '$lib/fuma/ui/input/index.js'
	import dayjs from 'dayjs'
	type $$Props = InputProps<Date> & { getDefaultDate?: () => Date }

	interface Props {
		value?: Date | null | undefined
		input?: HTMLInputAttributes
		getDefaultDate?: any
		[key: string]: any
	}

	let {
		value = $bindable(undefined),
		input = {},
		getDefaultDate = () => new Date(0),
		...rest
	}: Props = $props()

	let { class: inputClass = '', ...inputProps } = $derived(input)

	const dispatch = createEventDispatcher<{ input: Date | null }>()

	const onInput: FormEventHandler<HTMLInputElement> = ({ currentTarget }) => {
		value = getDateTime(currentTarget.value)
		dispatch('input', value)
	}

	function getDateTime(v: string | null | undefined): Date | null | undefined {
		if (!v) return value
		const date = value ? new Date(value) : getDefaultDate()
		const dateString = [
			date.getFullYear().toString(),
			(date.getMonth() + 1).toString().padStart(2, '0'),
			date.getDate().toString().padStart(2, '0'),
		].join('-')
		return new Date(`${dateString}T${v}`)
	}
</script>

<FormControl {...rest}>
	{#snippet children({ key })}
		<input
			value={value && dayjs(value).format('HH:mm')}
			oninput={onInput}
			onfocus={bubble('focus')}
			onblur={bubble('blur')}
			type="time"
			name={key}
			id={key}
			class="input {inputClass}"
			{...inputProps}
		/>
	{/snippet}
</FormControl>
