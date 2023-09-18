<script lang="ts">
	import { mdiClose } from '@mdi/js'

	import { browser } from '$app/environment'
	import { createEventDispatcher, tick } from 'svelte'
	import { debounce } from '$lib/debounce'

	import { useNotify } from '$lib/notify'
	import { selector } from '$lib/action'
	import { DropDown, Icon } from '$lib/material'
	import FormControl from './FormControl.svelte'
	import SelectorList from './SelectorList.svelte'
	import RelationAfter from './RelationAfter.svelte'

	type RelationItem = $$Generic<{ id: string }>

	export let key: string
	export let label = ''
	export let search: (q: string) => Promise<RelationItem[]>
	export let getItem: (id: string) => Promise<RelationItem>
	export let createUrl = ''
	export let createTitle = ''
	export let value: string | RelationItem = ''
	export let error = ''
	export let placeholder = ''

	let klass = ''
	export { klass as class }

	let proposedItems: RelationItem[] = []
	export let item: RelationItem | null = null

	let isLoading = false
	let isError = false
	let focusIndex = 0
	let searchValue = ''
	const notify = useNotify()

	const dispatch = createEventDispatcher<{ input: { value: string; item: RelationItem } }>()
	let inputElement: HTMLInputElement
	$: if (value && !item) lookupItem()

	async function lookupItem() {
		if (!browser || !value || item) return
		if (typeof value === 'string') item = await getItem(value as string)
		else item = value as RelationItem
	}

	async function select(index = focusIndex) {
		item = proposedItems[index]
		value = item.id
		dispatch('input', { value: item.id, item })
	}

	async function clear() {
		searchValue = ''
		value = ''
		item = null
		await tick()
		inputElement.focus()
	}

	async function searchItems(searchValue = '') {
		try {
			isLoading = true
			isError = false
			focusIndex = 0
			proposedItems = await search(searchValue)
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
	}
	async function handleBlur() {
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
	<DropDown>
		<div class="contents" slot="activator">
			<FormControl {key} {label} {error} class={klass} let:key>
				<div class="flex grow gap-2" class:hidden={item}>
					<div class="flex grow gap-2 items-center relative">
						<input
							type="text"
							id="relations_{key}"
							name="relations_{key}"
							bind:this={inputElement}
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

				{#if item}
					<div class="rounded-lg border flex items-center h-12 pl-4 pr-2 gap-2">
						<div class="grow">
							<slot name="item" {item}>
								{item.id}
							</slot>
						</div>
						<button type="button" on:click={() => clear()} class="btn btn-square btn-sm">
							<Icon path={mdiClose} />
						</button>
					</div>
					<input type="hidden" name={key} value={item.id} />
				{/if}
			</FormControl>
		</div>

		<SelectorList
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
	</DropDown>
</div>
