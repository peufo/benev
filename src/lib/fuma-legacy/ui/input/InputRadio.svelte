<script lang="ts">
	import type { Snippet } from 'svelte'
	import { onMount } from 'svelte'
	import { slide } from 'svelte/transition'

	import { type Options, parseOptions } from 'fuma'
	import { FormControl, bindValueWithParams, type InputProps } from '$lib/ui'

	type Props = InputProps & {
		options: Options
		optionsClass?: string
		label_append?: Snippet
	}

	let {
		input,
		value = $bindable(),
		error = $bindable(),
		options,
		optionsClass = '',
		hint,
		class: klass,
		label_append,
		...props
	}: Props = $props()

	let _options = $derived(parseOptions(options))

	let formControl: HTMLDivElement
	// Le contexte `useForm` a disparu avec la migration: les erreurs viennent maintenant
	// des `fields` de la remote function, ce composant ne sert plus qu'à choisir.
	onMount(() => {
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
			{@render label_append?.()}
		</div>
	{/if}

	<div class={optionsClass}>
		{#each _options as option (option.value)}
			<FormControl
				{...props}
				enhanceDisabled
				label={option.label}
				prefixFor={option.value}
				class="flex-row-reverse items-center justify-end gap-2"
			>
				{#snippet children({ key })}
					<input
						use:bindValueWithParams={{ bindEnable: props.bindWithParams }}
						bind:group={value}
						value={option.value}
						type="radio"
						name={key}
						id="{option.value}{key}"
						class="radio"
						{...input}
					/>
				{/snippet}
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
