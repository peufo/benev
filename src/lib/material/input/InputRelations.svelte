<script lang="ts">
	import { slide } from 'svelte/transition'
	import { mdiClose } from '@mdi/js'

	import { createEventDispatcher, tick } from 'svelte'
	import { debounce } from '$lib/debounce'

	import { useNotify } from '$lib/notify'
	import { Icon, DropDown } from '$lib/material'
	import FormControl from './FormControl.svelte'
	import SelectorList from './SelectorList.svelte'
	import RelationAfter from './RelationAfter.svelte'

	type RelationItem = $$Generic<{ id: string }>

	export let key = ''
	export let label = ''
	export let search: (q: string) => Promise<RelationItem[]>
	export let createUrl = ''
	export let createTitle = ''

	export let error = ''
	export let placeholder = ''
	export let flatMode = false

	let klass = ''
	export { klass as class }
	export let classList = ''

	let proposedItems: RelationItem[] = []
	export let items: RelationItem[] | null = null

	let isLoading = false
	let isError = false
	let focusIndex = 0
	let searchValue = ''
	const notify = useNotify()
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
			notify.error('Erreur')
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
					<div class="flex gap-2 flex-wrap">
						{#each items || [] as item, index (item.id)}
							<div
								transition:slide|local={{ axis: 'x', duration: 200 }}
								class="text-right badge badge-lg badge-outline whitespace-nowrap pr-0 items-center"
							>
								<slot {item} name="badge">{item.id}</slot>
								<div
									class="btn btn-circle btn-xs btn-ghost min-h-[18px] h-[18px] w-[18px] ml-1 mr-[2px]"
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
					<div class="flex grow gap-2 items-center relative">
						<input
							type="text"
							id={key}
							name={key}
							bind:this={inputSearch}
							bind:value={searchValue}
							on:input={(e) => searchItemsDebounce(e.currentTarget.value)}
							on:focus={handleFocus}
							on:blur={handleBlur}
							autocomplete="off"
							{placeholder}
							class="input-bordered input grow"
						/>

						<RelationAfter {isLoading} {createUrl} {createTitle} />
					</div>
					<slot name="append" />
				</div>
			</div>

			<input type="hidden" name={key} value={JSON.stringify(items?.map(({ id }) => id) || [])} />
		</FormControl>
	</div>

	<SelectorList
		trigger={inputSearch}
		items={proposedItems}
		{isError}
		{isLoading}
		{focusIndex}
		let:index
		class="w-full {classList}"
		on:select={({ detail }) => select(detail)}
	>
		<slot name="listItem" item={proposedItems[index]}>
			{proposedItems[index].id}
		</slot>
	</SelectorList>
</DropDown>
