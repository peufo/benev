<script lang="ts" generics="Item extends {id: string}">
	import { CalendarArrowDownIcon, CalendarArrowUpIcon, CalendarSearchIcon } from '@lucide/svelte'
	import { preventDefault } from 'svelte/legacy'
	import { untrack } from 'svelte'

	import { goto } from '$app/navigation'
	import { page } from '$app/stores'

	import { DropDown } from 'fuma'
	import { InputTime } from '$lib/ui'
	import type { TableField } from '$lib/fuma-legacy/ui/table/index.js'
	import { formatRange } from 'fuma'
	import { RangePicker, type RangeAsDate } from 'fuma'
	import { urlParam } from 'fuma'
	import { jsonParse } from 'fuma'
	import OrderButtons from '$lib/fuma-legacy/ui/table/head/OrderButtons.svelte'

	interface Props {
		field: Omit<TableField<Item>, 'getCell' | 'type'>
	}

	let { field }: Props = $props()

	let dropDown: DropDown = $state()!
	let rangePicker: RangePicker = $state()!
	// `field.key` identifie la colonne pour toute la durée de vie du composant.
	const fieldKey = untrack(() => field.key)
	const initialValue = jsonParse<{ start?: string; end?: string }>(
		$page.url.searchParams.get(fieldKey),
		{}
	)
	let { order } = $state(
		jsonParse<{ order?: 'asc' | 'desc' }>($page.url.searchParams.get(fieldKey), {})
	)

	let range: RangeAsDate = $state({
		start: initialValue.start ? new Date(initialValue.start) : null,
		end: initialValue.end ? new Date(initialValue.end) : null,
	})

	let isValidPeriod = $derived(!!range.start && !!range.end)

	function updateUrl() {
		if (!isValidPeriod && !order) {
			goto(urlParam.without(field.key, 'skip', 'take'), {
				replaceState: true,
				noScroll: true,
				keepFocus: true,
			})
			return
		}
		goto(
			urlParam.with(
				{
					[field.key]: JSON.stringify({
						...(isValidPeriod
							? {
									start: range.start?.toJSON(),
									end: range.end?.toJSON(),
								}
							: {}),
						...(order ? { order } : {}),
					}),
				},
				'skip',
				'take'
			),
			{ replaceState: true, noScroll: true, keepFocus: true }
		)
	}

	function handleReset() {
		isValidPeriod = false
		range.start = null
		range = { start: null, end: null }
		dropDown.hide()
		rangePicker.clear()
		goto(urlParam.without(field.key, 'skip', 'take'), {
			replaceState: true,
			noScroll: true,
			keepFocus: true,
		})
	}
</script>

<th class="p-1">
	<DropDown
		bind:this={dropDown}
		tippyProps={{ appendTo: () => document.body }}
		hideOnNav={false}
		class="max-h-none"
	>
		{#snippet activator()}
			<button class="menu-item min-h-8 w-full flex-wrap gap-y-1">
				<div class="flex gap-2">
					<span>{field.label}</span>
					{#if !isValidPeriod}
						<CalendarSearchIcon size={15} class="opacity-50" />
					{/if}
				</div>

				{#if isValidPeriod}
					<span class="badge badge-primary badge-xs text-[0.7rem] font-normal text-white">
						{formatRange(range)}
					</span>
				{/if}
				{#if order}
					{@const OrderIcon = order === 'asc' ? CalendarArrowUpIcon : CalendarArrowDownIcon}
					<OrderIcon size={18} class="text-primary" />
				{/if}
			</button>
		{/snippet}

		{#if field.sortable !== false}
			<OrderButtons
				bind:order
				onchange={() => {
					updateUrl()
					dropDown.hide()
				}}
				iconAsc={CalendarArrowUpIcon}
				iconDesc={CalendarArrowDownIcon}
			/>
		{/if}

		<form
			onsubmit={preventDefault(() => dropDown.hide())}
			data-sveltekit-replacestate
			class="flex flex-col font-normal"
			class:mt-6={field.sortable !== false}
		>
			<RangePicker
				bind:this={rangePicker}
				numberOfMonths={1}
				onchange={(newRange) => {
					range = newRange
					updateUrl()
				}}
			/>

			<input class="hidden" type="text" name="start" value={range.start?.toJSON()} />
			<input class="hidden" type="text" name="end" value={range.end?.toJSON()} />

			<div class="m-2 flex gap-2">
				<InputTime
					label="A partir de"
					bind:value={range.start}
					enhanceDisabled
					class="grow"
					oninput={updateUrl}
				/>
				<InputTime
					label="Jusqu'à"
					bind:value={range.end}
					enhanceDisabled
					class="grow"
					oninput={updateUrl}
				/>
			</div>

			<div class="m-2 flex flex-row-reverse gap-2">
				<button class="btn">Ok</button>
				<button class="btn btn-ghost" type="button" onclick={handleReset}>Effacer</button>
			</div>
		</form>
	</DropDown>
</th>
