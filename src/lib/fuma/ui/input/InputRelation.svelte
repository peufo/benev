<!-- @migration-task Error while migrating Svelte code: This migration would change the name of a slot (item to item_1) making the component unusable -->
<script lang="ts" generics="RelationItem extends {id: string}">
	import { createEventDispatcher, tick, type ComponentProps } from 'svelte'
	import type { HTMLInputAttributes } from 'svelte/elements'
	import debounce from 'debounce'
	import { toast } from 'svelte-sonner'
	import { mdiClose } from '@mdi/js'

	import { USE_COERCE_JSON } from '$lib/fuma/utils/constant.js'
	import { Icon } from '$lib/fuma/ui/icon/index.js'
	import { Slot } from '$lib/fuma/ui/slot/index.js'
	import { DropDown } from '$lib/fuma/ui/menu/index.js'
	import { FormControl, SelectorList } from '$lib/fuma/ui/input/index.js'
	import type { TippyProps } from '$lib/fuma/utils/tippy.js'
	import type { ComponentAndProps } from '$lib/fuma/utils/component.js'
	import RelationAfter from '$lib/fuma/ui/input/RelationAfter.svelte'

	export let key = Math.random().toString()
	export let label = ''
	export let search: (q: string) => Promise<RelationItem[]>
	export let createUrl = ''
	export let createTitle = 'Nouveau'
	export let createIcon: string | undefined = undefined
	let item: RelationItem | null = null
	export { item as value }
	export let error = ''
	export let placeholder = ''
	export let tippyProps: Partial<TippyProps> = {}
	export let dropdownProps: ComponentProps<DropDown> = {}
	export let flatMode = false
	export let slotItem: ((item: RelationItem) => ComponentAndProps | string) | null = null
	export let slotSuggestion: ((item: RelationItem) => ComponentAndProps | string) | null = slotItem
	export let input: HTMLInputAttributes | undefined = undefined

	let klass = ''
	export { klass as class }
	export let classList = ''

	let inputElement: HTMLInputElement

	let proposedItems: RelationItem[] = []

	let isLoading = false
	let isError = false
	let focusIndex = 0
	let searchValue = ''

	const dispatch = createEventDispatcher<{ input: { value: RelationItem } }>()

	export async function clear() {
		searchValue = ''
		item = null
		await tick()
		inputElement.focus()
	}

	async function select(index = focusIndex) {
		item = proposedItems[index]
		dispatch('input', { value: item })
	}

	async function searchItems(searchValue = '') {
		try {
			isLoading = true
			isError = false
			focusIndex = 0
			proposedItems = await search(searchValue)
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
	<div class="contents" slot="activator">
		<FormControl {key} {label} {error} class={klass} let:key>
			<div class="flex grow gap-2" class:hidden={item}>
				<div class="input input-bordered flex grow items-center pr-2">
					<input
						type="text"
						id={key}
						bind:this={inputElement}
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

			{#if item}
				<div class="flex h-12 items-center gap-2 rounded-lg border bg-base-100 pl-4 pr-2">
					<div class="grow">
						<slot name="item" {item}>
							<Slot slot={slotItem} args={item}>
								{item.id}
							</Slot>
						</slot>
					</div>
					<button type="button" on:click={() => clear()} class="btn btn-square btn-sm">
						<Icon path={mdiClose} />
					</button>
				</div>
				<input
					type="hidden"
					name={key}
					value="{USE_COERCE_JSON}{JSON.stringify({ id: item.id })}"
				/>
			{/if}
		</FormControl>
	</div>

	<SelectorList
		items={proposedItems}
		trigger={inputElement}
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
