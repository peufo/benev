<script lang="ts">
	import { mdiClose } from '@mdi/js'

	import { slide } from 'svelte/transition'

	import { browser } from '$app/environment'
	import { createEventDispatcher } from 'svelte'
	import { debounce } from '$lib/debounce'

	import { useNotify } from '$lib/notify'
	import { selector } from '$lib/action'
	import Icon from '$lib/material/Icon.svelte'
	import FormControl from './FormControl.svelte'
	import SelectorList from './SelectorList.svelte'
	import RelationAfter from './RelationAfter.svelte'

	type RelationItem = $$Generic<{ id: string }>

	export let key: string
	export let label: string
	export let search: (q: string) => Promise<RelationItem[]>
	export let getItems: (ids: string[]) => Promise<RelationItem[]>
	export let createUrl = ''
	export let createTitle = ''
	export let value: string[] | RelationItem[] = []
	export let error = ''
	export let placeholder = ''

	let klass = ''
	export { klass as class }

	let proposedItems: RelationItem[] = []
	export let items: RelationItem[] | null = null

	let isLoading = false
	let isError = false
	let focusIndex = 0
	let searchValue = ''
	const notify = useNotify()
	let selectorList: SelectorList<any>
	const dispatch = createEventDispatcher<{ input: { value: string[]; items: RelationItem[] } }>()

	$: if (value.length && !items) lookupItem()

	async function lookupItem() {
		if (!browser || !value.length || items) return
		if (typeof value[0] === 'string') items = await getItems(value as string[])
		else items = value as RelationItem[]
	}

	async function select(index = focusIndex) {
		if (!items) items = [proposedItems[index]]
		else items = [...items, proposedItems[index]]
		searchValue = ''
		searchItems('')
		dispatch('input', { value: items.map(({ id }) => id), items })
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
		selectorList.open()
	}
	async function handleBlur() {
		selectorList.close()
		searchValue = ''
	}
</script>

<div
	class="relative"
	use:selector={{
		focusIndex,
		onSelect: select,
		onFocus(index) {
			focusIndex = index
		},
	}}
>
	<FormControl key="relations_{key}" {label} {error} class={klass}>
		<input
			type="hidden"
			name="json_{key}"
			value={JSON.stringify(items?.map(({ id }) => id) || [])}
		/>

		<div class="flex flex-wrap items-center gap-2">
			{#if items && items.length}
				<div class="flex gap-2 flex-wrap">
					{#each items || [] as item, index (item.id)}
						<div
							transition:slide|local={{ axis: 'x', duration: 200 }}
							class="text-right badge badge-lg whitespace-nowrap pr-0"
						>
							<slot {item} name="badge">{item.id}</slot>
							<div
								class="btn btn-circle btn-xs btn-ghost scale-75 ml-1"
								role="button"
								tabindex="0"
								on:click={() => remove(index)}
								on:keyup={() => remove(index)}
							>
								<Icon path={mdiClose} />
							</div>
						</div>
					{/each}
				</div>
			{/if}

			<input
				type="text"
				id="relations_{key}"
				name="relations_{key}"
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
	</FormControl>

	<SelectorList
		bind:this={selectorList}
		items={proposedItems}
		{isError}
		{isLoading}
		{focusIndex}
		on:select={({ detail }) => select(detail)}
		class="w-full"
		let:index
	>
		{@const item = proposedItems[index]}
		<slot name="listItem" {item}>{item.id}</slot>
	</SelectorList>
</div>
