<!-- @migration-task Error while migrating Svelte code: This migration would change the name of a slot (item to item_1) making the component unusable -->
<script lang="ts" generics="RelationItem extends {id: string}">
	import type { HTMLInputAttributes } from 'svelte/elements'

	import { createEventDispatcher, tick } from 'svelte'
	import { slide } from 'svelte/transition'
	import { toast } from 'svelte-sonner'
	import { mdiClose } from '@mdi/js'
	import debounce from 'debounce'

	import { USE_COERCE_JSON } from '$lib/fuma/utils/constant.js'
	import { Icon } from '$lib/fuma/ui/icon/index.js'
	import { Slot } from '$lib/fuma/ui/slot/index.js'
	import { FormControl, SelectorList } from '$lib/fuma/ui/input/index.js'
	import { DropDown } from '$lib/fuma/ui/menu/index.js'
	import type { ComponentAndProps } from '$lib/fuma/utils/component.js'
	import RelationAfter from '$lib/fuma/ui/input/RelationAfter.svelte'

	export let key = ''
	export let label = ''
	export let search: (q: string) => Promise<RelationItem[]>
	export let createUrl = ''
	export let createTitle = ''
	export let createIcon: string | undefined = undefined
	export let error = ''
	export let placeholder = ''
	export let flatMode = false
	export let slotItem: ((item: RelationItem) => ComponentAndProps | string) | null = null
	export let slotSuggestion: ((item: RelationItem) => ComponentAndProps | string) | null = slotItem
	export let input: HTMLInputAttributes | undefined = undefined

	let klass = ''
	export { klass as class }
	export let classList = ''

	let proposedItems: RelationItem[] = []
	let items: RelationItem[] | null = null
	export { items as value }

	let isLoading = false
	let isError = false
	let focusIndex = 0
	let searchValue = ''

	let dropdown: DropDown
	const dispatch = createEventDispatcher<{ input: { value: string[]; items: RelationItem[] } }>()
	let inputSearch: HTMLInputElement

	async function select(index = focusIndex) {
		const proposedItem = proposedItems[index]
		if (!proposedItem) return
		if (!items) items = [proposedItem]
		else items = [...items, proposedItem]
		dropdown.hide()
		inputSearch.select()
		proposedItems = [...proposedItems.slice(0, index), ...proposedItems.slice(index + 1)]
		dispatch('input', { value: items.map(({ id }) => id), items })
		await tick()
		setTimeout(() => dropdown.show(), 200)
	}

	function remove(index: number) {
		if (!items?.length) return
		items = [...items.slice(0, index), ...items.slice(index + 1)]
	}

	async function searchItems(searchValue = '') {
		try {
			isLoading = true
			isError = false
			focusIndex = 0
			const res = await search(searchValue)
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
		// dropdown.show()
	}
	async function handleBlur() {
		// dropdown.hide()
		searchValue = ''
	}
</script>

<DropDown bind:this={dropdown} disable={flatMode}>
	<div slot="activator">
		<FormControl {key} {label} {error} class={klass}>
			<div class="flex flex-col gap-2">
				{#if items && items.length}
					<div class="flex flex-wrap gap-2">
						{#each items || [] as item, index (item.id)}
							<div
								transition:slide|local={{ axis: 'x', duration: 200 }}
								class="badge badge-outline badge-lg items-center whitespace-nowrap pr-0 text-right"
							>
								<slot {item} name="item">
									<Slot slot={slotItem} args={item}>
										{item.id}
									</Slot>
								</slot>
								<div
									class="btn btn-circle btn-ghost btn-xs ml-1 mr-[2px] h-[18px] min-h-[18px] w-[18px]"
									role="button"
									tabindex="0"
									on:click={() => remove(index)}
									on:keyup={(event) => event.key === 'Enter' && remove(index)}
								>
									<Icon path={mdiClose} size={16} />
								</div>
							</div>
						{/each}
					</div>
				{/if}
				<div class="flex grow gap-2">
					<div class="input input-bordered flex grow items-center pr-2">
						<input
							type="text"
							id={key}
							bind:this={inputSearch}
							bind:value={searchValue}
							on:input={(e) => searchItemsDebounce(e.currentTarget.value)}
							on:focus={handleFocus}
							on:blur={handleBlur}
							autocomplete="off"
							{placeholder}
							class="grow"
							size={8}
							{...input}
						/>

						<RelationAfter {isLoading} {createUrl} {createTitle} {createIcon} />
					</div>
					<slot name="append" />
				</div>
			</div>

			<input
				type="hidden"
				name={key}
				value="{USE_COERCE_JSON}{JSON.stringify(items?.map(({ id }) => ({ id })) || [])}"
			/>
		</FormControl>
	</div>

	<SelectorList
		trigger={inputSearch}
		items={proposedItems}
		{isError}
		{isLoading}
		{focusIndex}
		let:index
		class="w-full min-w-40 {classList}"
		on:select={({ detail }) => select(detail)}
	>
		<slot name="suggestion" item={proposedItems[index]}>
			<Slot slot={slotSuggestion} args={proposedItems[index]}>
				{proposedItems[index].id}
			</Slot>
		</slot>
	</SelectorList>
</DropDown>
