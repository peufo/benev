<script lang="ts">
	import { slide } from 'svelte/transition'
	import { onMount } from 'svelte'
	import type { AnyComponent, ComponentAndProps } from '$lib/fuma-legacy/utils/index.js'
	import { Slot } from '$lib/fuma-legacy/ui/index.js'

	interface Props {
		class?: string
		classLabel?: string
		key?: string
		label?: ComponentAndProps | AnyComponent | string
		error?: string
		hint?: string
		prefix?: string | number
		prefixFor?: string | number
		/**
		 * Sans effet depuis la migration: les erreurs remontent par les `fields` de la remote
		 * function, plus par le contexte de `useForm`. La prop est gardée pour les appelants.
		 */
		enhanceDisabled?: boolean
		labelPosition?: LabelPosition
		label_append?: import('svelte').Snippet
		children?: import('svelte').Snippet<[any]>
	}

	let {
		class: klass = '',
		classLabel = '',
		key = '',
		label = '',
		error = $bindable(''),
		hint = '',
		prefix = '',
		prefixFor = '',
		enhanceDisabled = false,
		labelPosition = 'top',
		label_append,
		children,
	}: Props = $props()

	type LabelPosition = 'top' | 'left' | 'right'

	let _key = $derived(prefix && key ? `${prefix}_${key}` : key || '')

	let formControl: HTMLDivElement = $state()!
	onMount(() => {
		const input = formControl.querySelector('input, textarea')
		if (!input) return
		const handleInput = () => (error = '')
		input.addEventListener('input', handleInput)
		return () => {
			input.removeEventListener('input', handleInput)
		}
	})
</script>

<div class="form-control {klass}" bind:this={formControl}>
	<div
		class:contents={labelPosition === 'top'}
		class:flex={labelPosition !== 'top'}
		class:items-center={labelPosition !== 'top'}
		class:gap-2={labelPosition !== 'top'}
		class:flex-row-reverse={labelPosition === 'right'}
		class:justify-end={labelPosition === 'right'}
	>
		{#if label}
			<label for="{prefixFor}{_key}" class="label cursor-pointer {classLabel}">
				<span class="label-text">
					<Slot slot={label} />
				</span>
				{@render label_append?.()}
			</label>
		{/if}

		{@render children?.({ key: _key })}
	</div>

	{#if error}
		<label for="{prefixFor}{_key}" class="label" transition:slide>
			<span class="label-text-alt text-warning">{error}</span>
		</label>
	{:else if hint}
		<label for="{prefixFor}{_key}" class="label" transition:slide>
			<span class="label-text-alt text-neutral">{hint}</span>
		</label>
	{/if}
</div>
