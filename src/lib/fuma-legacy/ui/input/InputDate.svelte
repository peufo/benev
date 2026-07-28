<script lang="ts">
	import { createBubbler } from 'svelte/legacy'

	const bubble = createBubbler()
	import type { FormEventHandler, HTMLInputAttributes } from 'svelte/elements'
	import dayjs from 'dayjs'

	import { FormControl, type InputProps } from '$lib/fuma-legacy/ui/input/index.js'
	import { USE_COERCE_DATE } from 'fuma'

	type $$Props = InputProps<Date | null | undefined>
	interface Props {
		value?: Date | null | undefined
		input?: HTMLInputAttributes
		[key: string]: any
		/** Remplacent les évènements de la version Svelte 4. */
		oninput?: (value: Date | null) => void
	}

	let { value = $bindable(undefined), input = {}, oninput, ...rest }: Props = $props()
	let { class: inputClass = '', ...inputProps } = $derived(input)

	const handleInput: FormEventHandler<HTMLInputElement> = ({ currentTarget }) => {
		const newValue = currentTarget.valueAsDate
		if (newValue === null) value = null
		newValue?.setHours(value?.getHours() || 0, value?.getMinutes() || 0, value?.getSeconds() || 0)
		value = newValue
		oninput?.(value)
	}
</script>

<FormControl {...rest}>
	{#snippet children({ key })}
		<input
			value={value && dayjs(value).format('YYYY-MM-DD')}
			oninput={handleInput}
			onfocus={bubble('focus')}
			onblur={bubble('blur')}
			type="date"
			id={key}
			class="input {inputClass}"
			{...inputProps}
		/>

		<input type="hidden" name={key} value="{USE_COERCE_DATE}{value?.toJSON()}" />
	{/snippet}
</FormControl>
