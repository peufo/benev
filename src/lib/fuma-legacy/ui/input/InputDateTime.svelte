<script lang="ts">
	import { createBubbler } from 'svelte/legacy'

	const bubble = createBubbler()
	import type { FormEventHandler, HTMLInputAttributes } from 'svelte/elements'
	import { USE_COERCE_DATE } from 'fuma'
	import { FormControl, type InputProps } from '$lib/fuma-legacy/ui/input/index.js'
	import dayjs from 'dayjs'

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
		value = getDateTime(currentTarget.value)
		oninput?.(value)
	}

	function getDateTime(v: string | null | undefined): Date | null {
		if (typeof v !== 'string') return null
		return new Date(v)
	}
</script>

<FormControl {...rest}>
	{#snippet children({ key })}
		<input
			value={value && dayjs(value).format('YYYY-MM-DDTHH:mm')}
			oninput={handleInput}
			onfocus={bubble('focus')}
			onblur={bubble('blur')}
			type="datetime-local"
			id={key}
			class="input {inputClass}"
			{...inputProps}
		/>

		<input type="hidden" name={key} value="{USE_COERCE_DATE}{value?.toJSON()}" />
	{/snippet}
</FormControl>
