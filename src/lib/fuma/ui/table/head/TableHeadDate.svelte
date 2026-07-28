<script lang="ts" generics="Item extends {id: string}">
	import { preventDefault } from 'svelte/legacy';

	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import {
		mdiCalendarFilterOutline,
		mdiSortClockAscendingOutline,
		mdiSortClockDescendingOutline,
	} from '@mdi/js'

	import { DropDown } from '$lib/fuma/ui/menu/index.js'
	import { InputTime } from '$lib/fuma/ui/input/index.js'
	import type { TableField } from '$lib/fuma/ui/table/index.js'
	import { formatRange } from '$lib/fuma/ui/range/format.js'
	import { RangePicker, type RangeAsDate } from '$lib/fuma/ui/range/index.js'
	import { urlParam } from '$lib/fuma/store/param.js'
	import { jsonParse } from '$lib/fuma/utils/jsonParse.js'
	import { Icon } from '$lib/fuma/ui/icon/index.js'
	import OrderButtons from '$lib/fuma/ui/table/head/OrderButtons.svelte'

	interface Props {
		field: Omit<TableField<Item>, 'getCell' | 'type'>;
	}

	let { field }: Props = $props();

	let dropDown: DropDown = $state()
	let rangePicker: RangePicker = $state()
	const initialValue = jsonParse<{ start?: string; end?: string }>(
		$page.url.searchParams.get(field.key),
		{}
	)
	let { order } = $state(jsonParse<{ order?: 'asc' | 'desc' }>($page.url.searchParams.get(field.key), {}))

	let range: RangeAsDate = $state({
		start: initialValue.start ? new Date(initialValue.start) : null,
		end: initialValue.end ? new Date(initialValue.end) : null,
	})

	let isValidPeriod = $state(!!range.start && !!range.end)

	function updateUrl() {
		isValidPeriod = !!range.start && !!range.end
		if (!isValidPeriod && !order) {
			goto($urlParam.without(field.key, 'skip', 'take'), {
				replaceState: true,
				noScroll: true,
				keepFocus: true,
			})
			return
		}
		goto(
			$urlParam.with(
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
		goto($urlParam.without(field.key, 'skip', 'take'), {
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
				<button  class="menu-item min-h-8 w-full flex-wrap gap-y-1">
				<div class="flex gap-2">
					<span>{field.label}</span>
					{#if !isValidPeriod}
						<Icon path={mdiCalendarFilterOutline} size={15} class="opacity-50" />
					{/if}
				</div>

				{#if isValidPeriod}
					<span class="badge badge-primary badge-xs text-[0.7rem] font-normal text-white">
						{formatRange(range)}
					</span>
				{/if}
				{#if order}
					<Icon
						path={order === 'asc' ? mdiSortClockAscendingOutline : mdiSortClockDescendingOutline}
						size={18}
						class="fill-primary"
					/>
				{/if}
			</button>
			{/snippet}

		{#if field.sortable !== false}
			<OrderButtons
				bind:order
				on:change={() => {
					updateUrl()
					dropDown.hide()
				}}
				iconAsc={mdiSortClockAscendingOutline}
				iconDesc={mdiSortClockDescendingOutline}
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
				on:change={({ detail: newRange }) => {
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
					on:input={updateUrl}
				/>
				<InputTime
					label="Jusqu'à"
					bind:value={range.end}
					enhanceDisabled
					class="grow"
					on:input={updateUrl}
				/>
			</div>

			<div class="m-2 flex flex-row-reverse gap-2">
				<button class="btn">Ok</button>
				<button class="btn btn-ghost" type="button" onclick={handleReset}>Effacer</button>
			</div>
		</form>
	</DropDown>
</th>
