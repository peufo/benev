<script lang="ts">
	import type { Snippet } from 'svelte'
	import type { FocusEventHandler, FormEventHandler, KeyboardEventHandler } from 'svelte/elements'
	import { FormControl, bindValueWithParams, type InputProps } from '$lib/ui'

	type Props = InputProps & {
		inputElement?: HTMLInputElement
		// En mode runes le transfert d'événements passe par des props explicites: le
		// reste (`...props`) part sur FormControl, pas sur l'`<input>`.
		oninput?: FormEventHandler<HTMLInputElement>
		onfocus?: FocusEventHandler<HTMLInputElement>
		onblur?: FocusEventHandler<HTMLInputElement>
		onkeydown?: KeyboardEventHandler<HTMLInputElement>
		onkeyup?: KeyboardEventHandler<HTMLInputElement>
		label_append?: Snippet
		prepend?: Snippet<[InputProps['value']]>
		append?: Snippet<[InputProps['value']]>
	}

	let {
		input,
		value = $bindable(),
		classWrapper,
		bindWithParams,
		inputElement = $bindable(),
		oninput,
		onfocus,
		onblur,
		onkeydown,
		onkeyup,
		label_append,
		prepend,
		append,
		...props
	}: Props = $props()

	let inputClass = $derived(input?.class)
	let inputProps = $derived.by(() => {
		const { class: _class, ...rest } = input || {}
		return rest
	})
</script>

<FormControl {...props} enhanceDisabled={props.enhanceDisabled || bindWithParams} {label_append}>
	{#snippet children({ key })}
		<div class={classWrapper}>
			{@render prepend?.(value)}
			<input
				bind:value
				bind:this={inputElement}
				{oninput}
				{onfocus}
				{onblur}
				{onkeydown}
				{onkeyup}
				use:bindValueWithParams={{ bindEnable: bindWithParams, initValue: (v) => (value = v) }}
				type="text"
				name={key}
				id={key}
				class="input w-full {inputClass || ''}"
				{...inputProps}
			/>
			{@render append?.(value)}
		</div>
	{/snippet}
</FormControl>
