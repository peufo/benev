<script lang="ts">
	import { createBubbler } from 'svelte/legacy'

	const bubble = createBubbler()
	import type { HTMLInputAttributes, FormEventHandler } from 'svelte/elements'
	import { FormControl, type InputProps } from '$lib/fuma-legacy/ui/input/index.js'
	import dayjs from 'dayjs'
	type $$Props = InputProps<Date> & { getDefaultDate?: () => Date }

	interface Props {
		value?: Date | null | undefined
		input?: HTMLInputAttributes
		getDefaultDate?: any
		[key: string]: any
		/** Remplacent les évènements de la version Svelte 4. */
		oninput?: (value: Date | null | undefined) => void
	}

	let {
		value = $bindable(undefined),
		input = {},
		getDefaultDate = () => new Date(0),
		oninput,
		...rest
	}: Props = $props()

	let { class: inputClass = '', ...inputProps } = $derived(input)

	const onInput: FormEventHandler<HTMLInputElement> = ({ currentTarget }) => {
		value = getDateTime(currentTarget.value)
		oninput?.(value)
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
