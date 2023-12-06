<script lang="ts">
	import { onMount } from 'svelte'
	import { slide } from 'svelte/transition'
	import FormControl from './FormControl.svelte'
	import { type InputProps, type Options, parseOptions } from '.'
	import { bindValueWithParams } from './action'
	import { formContext } from '$lib/validation'
	type $$Props = InputProps & { options: Options; optionsClass?: string }
	$: ({
		input,
		value: _value,
		error: _error,
		options,
		optionsClass = '',
		hint,
		class: klass,
		...props
	} = $$props as $$Props)
	export let value = _value
	export let error = _error

	$: _options = parseOptions(options)

	let formControl: HTMLDivElement
	const { setError } = formContext.get()
	onMount(() => {
		if (props.key) setError[props.key] = (err) => (error = err)

		const inputs = formControl.querySelectorAll('input')
		const handleInput = () => (error = '')
		inputs.forEach((input) => input.addEventListener('input', handleInput))
		return () => {
			inputs.forEach((input) => input.removeEventListener('input', handleInput))
		}
	})
</script>

<div class={klass} bind:this={formControl}>
	{#if props.label}
		<div class="label">
			<span class="label-text">{props.label}</span>
			<slot name="label_append" />
		</div>
	{/if}

	<div class={optionsClass}>
		{#each _options as option}
			<FormControl
				{...props}
				let:key
				enhanceDisabled
				label={option.label}
				prefixFor={option.value}
				class="flex-row-reverse justify-end items-center gap-2"
			>
				<input
					use:bindValueWithParams={{ bindEnable: props.bindWithParams }}
					bind:group={value}
					on:input
					on:focus
					on:blur
					value={option.value}
					type="radio"
					name={key}
					id="{option.value}{key}"
					class="radio"
					{...input}
				/>
			</FormControl>
		{/each}
	</div>

	{#if error}
		<div class="label" transition:slide>
			<span class="label-text-alt text-warning">{error}</span>
		</div>
	{:else if hint}
		<div class="label" transition:slide>
			<span class="label-text-alt text-info">{hint}</span>
		</div>
	{/if}
</div>
