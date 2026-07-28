<script lang="ts" generics="RelationItem extends {id: string}">
	import { tick, type ComponentProps, type Snippet } from 'svelte'
	import type { HTMLInputAttributes } from 'svelte/elements'
	import debounce from 'debounce'
	import { toast } from 'svelte-sonner'
	import { mdiClose } from '@mdi/js'

	import { USE_COERCE_JSON } from 'fuma'
	import { Icon } from '$lib/fuma-legacy/ui/icon/index.js'
	import { Slot } from '$lib/fuma-legacy/ui/slot/index.js'
	import { DropDown } from 'fuma'
	import { FormControl, SelectorList } from '$lib/fuma-legacy/ui/input/index.js'
	import type { TippyProps } from 'fuma'
	import type { ComponentAndProps } from '$lib/fuma-legacy/utils/component.js'
	import RelationAfter from '$lib/fuma-legacy/ui/input/RelationAfter.svelte'

	interface Props {
		key?: string
		label?: string
		search: (q: string) => Promise<RelationItem[]>
		createUrl?: string
		createTitle?: string
		createIcon?: string
		value?: RelationItem | null
		error?: string
		placeholder?: string
		tippyProps?: Partial<TippyProps>
		dropdownProps?: ComponentProps<typeof DropDown>
		flatMode?: boolean
		slotItem?: ((item: RelationItem) => ComponentAndProps | string) | null
		slotSuggestion?: ((item: RelationItem) => ComponentAndProps | string) | null
		input?: HTMLInputAttributes
		class?: string
		classList?: string
		/** Remplace l'évènement `input` de la version Svelte 4. */
		oninput?: (value: RelationItem) => void
		item?: Snippet<[{ item: RelationItem }]>
		suggestion?: Snippet<[{ item: RelationItem }]>
		append?: Snippet
	}

	let {
		key = Math.random().toString(),
		label = '',
		search,
		createUrl = '',
		createTitle = 'Nouveau',
		createIcon = undefined,
		value = $bindable(null),
		error = '',
		placeholder = '',
		tippyProps = {},
		dropdownProps = {},
		flatMode = false,
		slotItem = null,
		slotSuggestion = slotItem,
		input = undefined,
		class: klass = '',
		classList = '',
		oninput,
		// Renommés à la destructuration: `item`/`suggestion` désignent les snippets,
		// alors que la valeur sélectionnée s'appelait déjà `item` en Svelte 4.
		item: itemSnippet,
		suggestion: suggestionSnippet,
		append,
	}: Props = $props()

	let inputElement: HTMLInputElement
	let proposedItems: RelationItem[] = $state([])

	let isLoading = $state(false)
	let isError = $state(false)
	let focusIndex = $state(0)
	let searchValue = $state('')

	export async function clear() {
		searchValue = ''
		value = null
		await tick()
		inputElement.focus()
	}

	async function select(index = focusIndex) {
		value = proposedItems[index]
		oninput?.(value)
	}

	async function searchItems(query = '') {
		try {
			isLoading = true
			isError = false
			focusIndex = 0
			proposedItems = await search(query)
		} catch (error) {
			toast.error('Erreur')
			isError = true
			console.error(error)
		} finally {
			isLoading = false
		}
	}

	const searchItemsDebounce = debounce(searchItems, 150)

	function handleFocus() {
		searchItems()
	}
	async function handleBlur() {
		searchValue = ''
	}
</script>

<DropDown {tippyProps} disable={flatMode} {...dropdownProps}>
	{#snippet activator()}
		<div class="contents">
			<FormControl {key} {label} {error} class={klass}>
				{#snippet children({ key: controlKey })}
					<div class="flex grow gap-2" class:hidden={value}>
						<div class="input flex grow items-center pr-2">
							<input
								type="text"
								id={controlKey}
								bind:this={inputElement}
								bind:value={searchValue}
								oninput={(e) => searchItemsDebounce(e.currentTarget.value)}
								onfocus={handleFocus}
								onblur={handleBlur}
								autocomplete="off"
								{placeholder}
								class="grow"
								size={8}
								{...input}
							/>

							<RelationAfter {isLoading} {createUrl} {createTitle} {createIcon} />
						</div>
						{@render append?.()}
					</div>

					{#if value}
						<div class="flex h-12 items-center gap-2 rounded-lg border bg-base-100 pl-4 pr-2">
							<div class="grow">
								{#if itemSnippet}
									{@render itemSnippet({ item: value })}
								{:else}
									<Slot slot={slotItem} args={value}>
										{value.id}
									</Slot>
								{/if}
							</div>
							<button type="button" onclick={() => clear()} class="btn btn-square btn-sm">
								<Icon path={mdiClose} />
							</button>
						</div>
						<input
							type="hidden"
							name={controlKey}
							value="{USE_COERCE_JSON}{JSON.stringify({ id: value.id })}"
						/>
					{/if}
				{/snippet}
			</FormControl>
		</div>
	{/snippet}

	<SelectorList
		items={proposedItems}
		trigger={inputElement}
		{isError}
		{isLoading}
		{focusIndex}
		class="w-full min-w-40 {classList}"
		onSelect={(index) => select(index)}
	>
		{#snippet children({ item })}
			{#if suggestionSnippet}
				{@render suggestionSnippet({ item })}
			{:else}
				<Slot slot={slotSuggestion} args={item}>
					{item.id}
				</Slot>
			{/if}
		{/snippet}
	</SelectorList>
</DropDown>
