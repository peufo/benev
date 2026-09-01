<script lang="ts">
	import type { ClassValue } from 'svelte/elements'
	import { InputSelect, parseOptions, urlParam, type Option, type Options } from 'fuma'
	import { goto } from '$app/navigation'
	import { page } from '$app/state'

	interface Props {
		key: string
		options: Options
		/** Ce que dit le champ quand la clé est absente: l'ensemble non filtré. */
		placeholder?: string
		/** Retirées de l'URL en même temps que la clé change. */
		removeKeys?: string[]
		class?: ClassValue
	}

	let { key, options, placeholder, removeKeys = [], class: klass }: Props = $props()

	let items = $derived(parseOptions(options))

	// Dérivé assignable: la sélection vit dans l'URL — c'est elle que lit le `load` — mais
	// `InputSelect` la porte en item. Le dérivé se ré-amorce à chaque navigation, ce qui fait
	// suivre les boutons précédent/suivant du navigateur.
	let selection = $derived(items.find(({ value }) => value === page.url.searchParams.get(key)))

	function select(option: Option | undefined) {
		const url = option
			? urlParam.with({ [key]: option.value }, ...removeKeys)
			: urlParam.without(key, ...removeKeys)
		goto(url, { replaceState: true, noScroll: true, keepFocus: true })
	}
</script>

{#snippet option(opt: Option)}
	{@const OptIcon = opt.icon}
	<span class="flex items-center gap-2 truncate">
		{#if OptIcon}
			<OptIcon size={18} class="opacity-70 shrink-0" />
		{/if}
		{opt.label}
	</span>
{/snippet}

<InputSelect
	bind:value={selection}
	onSelect={select}
	{items}
	{placeholder}
	nullable
	class={['input-sm w-52!', klass]}
	selected={option}
	proposal={option}
/>
