<script lang="ts" generics="RelationItem extends {id: string}">
	import type { HTMLInputAttributes } from 'svelte/elements'

	import { tick, type Snippet } from 'svelte'
	import { slide } from 'svelte/transition'
	import { toast } from 'svelte-sonner'
	import { mdiClose } from '@mdi/js'
	import debounce from 'debounce'

	import { USE_COERCE_JSON } from 'fuma'
	import { Icon } from '$lib/fuma-legacy/ui/icon/index.js'
	import { Slot } from '$lib/fuma-legacy/ui/slot/index.js'
	import { FormControl, SelectorList } from '$lib/fuma-legacy/ui/input/index.js'
	import { DropDown } from 'fuma'
	import type { ComponentAndProps } from '$lib/fuma-legacy/utils/component.js'
	import RelationAfter from '$lib/fuma-legacy/ui/input/RelationAfter.svelte'

	interface Props {
		key?: string
		label?: string
		search: (q: string) => Promise<RelationItem[]>
		createUrl?: string
		createTitle?: string
		createIcon?: string
		error?: string
		placeholder?: string
		flatMode?: boolean
		slotItem?: ((item: RelationItem) => ComponentAndProps | string) | null
		slotSuggestion?: ((item: RelationItem) => ComponentAndProps | string) | null
		input?: HTMLInputAttributes
		class?: string
		classList?: string
		value?: RelationItem[] | null
		/** Remplace l'évènement `input` de la version Svelte 4. */
		oninput?: (payload: { value: string[]; items: RelationItem[] }) => void
		item?: Snippet<[{ item: RelationItem }]>
		suggestion?: Snippet<[{ item: RelationItem }]>
		append?: Snippet
	}

	let {
		key = '',
		label = '',
		search,
		createUrl = '',
		createTitle = '',
		createIcon = undefined,
		error = '',
		placeholder = '',
		flatMode = false,
		slotItem = null,
		slotSuggestion = slotItem,
		input = undefined,
		class: klass = '',
		classList = '',
		value: items = $bindable(null),
		oninput,
		// Renommés à la destructuration: collision avec la variable de boucle `item`.
		item: itemSnippet,
		suggestion: suggestionSnippet,
		append,
	}: Props = $props()

	let proposedItems: RelationItem[] = $state([])
	let isLoading = $state(false)
	let isError = $state(false)
	let focusIndex = $state(0)
	let searchValue = $state('')

	let dropdown: DropDown
	let inputSearch: HTMLInputElement = $state()!

	async function select(index = focusIndex) {
		const proposedItem = proposedItems[index]
		if (!proposedItem) return
		if (!items) items = [proposedItem]
		else items = [...items, proposedItem]
		dropdown.hide()
		inputSearch.select()
		proposedItems = [...proposedItems.slice(0, index), ...proposedItems.slice(index + 1)]
		oninput?.({ value: items.map(({ id }) => id), items })
		await tick()
		setTimeout(() => dropdown.show(), 200)
	}

	function remove(index: number) {
		if (!items?.length) return
		items = [...items.slice(0, index), ...items.slice(index + 1)]
	}

	async function searchItems(query = '') {
		try {
			isLoading = true
			isError = false
			focusIndex = 0
			const res = await search(query)
			const currentIds = items?.map(({ id }) => id) || []
			proposedItems = res.filter(({ id }) => !currentIds.includes(id))
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

<DropDown bind:this={dropdown} disable={flatMode}>
	{#snippet activator()}
		<div>
			<FormControl {key} {label} {error} class={klass}>
				<div class="flex flex-col gap-2">
					{#if items && items.length}
						<div class="flex flex-wrap gap-2">
							{#each items || [] as item, index (item.id)}
								<div
									transition:slide|local={{ axis: 'x', duration: 200 }}
									class="badge badge-outline badge-lg items-center whitespace-nowrap pr-0 text-right"
								>
									{#if itemSnippet}
										{@render itemSnippet({ item })}
									{:else}
										<Slot slot={slotItem} args={item}>
											{item.id}
										</Slot>
									{/if}
									<div
										class="btn btn-circle btn-ghost btn-xs ml-1 mr-[2px] h-[18px] min-h-[18px] w-[18px]"
										role="button"
										tabindex="0"
										onclick={() => remove(index)}
										onkeyup={(event) => event.key === 'Enter' && remove(index)}
									>
										<Icon path={mdiClose} size={16} />
									</div>
								</div>
							{/each}
						</div>
					{/if}
					<div class="flex grow gap-2">
						<div class="input flex grow items-center pr-2">
							<input
								type="text"
								id={key}
								bind:this={inputSearch}
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
				</div>

				<input
					type="hidden"
					name={key}
					value="{USE_COERCE_JSON}{JSON.stringify(items?.map(({ id }) => ({ id })) || [])}"
				/>
			</FormControl>
		</div>
	{/snippet}

	<SelectorList
		trigger={inputSearch}
		items={proposedItems}
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
