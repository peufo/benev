<script lang="ts">
	import type { Snippet } from 'svelte'
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { mdiClose } from '@mdi/js'

	import { urlParam } from 'fuma'
	import { jsonParse } from 'fuma'
	import { type Options, parseOptions } from '$lib/fuma-legacy/utils/options'
	import { Icon } from '$lib/fuma-legacy/ui/icon/index.js'
	import { DropDown } from 'fuma'
	import { FormControl, type InputProps } from '$lib/fuma-legacy/ui/input/index.js'

	type Props = InputProps<string[]> & {
		key: string
		options: Options
		right?: boolean
		btnClass?: string
		badgePrimary?: boolean
		/** Contenu du bouton, à la place du simple `label`. */
		labelSnippet?: Snippet
	}

	let {
		input,
		key,
		options,
		value = $bindable(),
		class: klass,
		label,
		right,
		btnClass,
		badgePrimary,
		labelSnippet,
		...props
	}: Props = $props()

	// Valeur initiale reprise de l'URL quand l'appelant n'en fournit pas.
	if (value === undefined) value = jsonParse($page.url.searchParams.get(key), [])

	let dropdown: DropDown

	let _options = $derived(parseOptions(options))

	async function writeUrl() {
		const url = value?.length
			? urlParam.with({ [key]: JSON.stringify(value) })
			: urlParam.without(key)
		return goto(url, { replaceState: true, noScroll: true })
	}

	function handleReset() {
		dropdown.hide()
		value = []
		goto(urlParam.without(key), { replaceState: true })
	}
</script>

<input type="hidden" name={key} value={JSON.stringify(value)} />

<DropDown bind:this={dropdown} tippyProps={{ onHidden: writeUrl }} classWrapper="mb-[-2px]">
	{#snippet activator()}
		<div class="join" class:ml-2={value?.length}>
			<button class="btn indicator join-item btn-sm {btnClass || ''}">
				{#if labelSnippet}
					{@render labelSnippet()}
				{:else}
					<span>{label}</span>
				{/if}
				{#if !!value?.length}
					<span
						class="
							badge indicator-item badge-sm indicator-start
							{badgePrimary ? 'badge-primary' : 'badge-outline bg-base-100'}
						"
					>
						{value?.length}
					</span>
				{/if}
			</button>
			{#if !!value?.length}
				<button class="btn btn-square join-item btn-sm" onclick={handleReset}>
					<Icon path={mdiClose} class="fill-base-content" />
				</button>
			{/if}
		</div>
	{/snippet}

	<div class={klass}>
		{#each _options as option, index (option.value)}
			<FormControl
				{...props}
				label={option.label}
				prefixFor={index}
				class="flex-row-reverse items-center justify-end gap-2 whitespace-nowrap"
			>
				{#snippet children({ key: controlKey })}
					<input
						bind:group={value}
						value={option.value}
						type="checkbox"
						id="{index}{controlKey}"
						class="checkbox"
						{...input}
					/>
				{/snippet}
			</FormControl>
		{:else}
			<div class="px-3 py-2 rounded opacity-70">Aucun élément</div>
		{/each}
	</div>
</DropDown>
