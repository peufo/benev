<script lang="ts" generics="Item extends {id: string}">
	import { preventDefault } from 'svelte/legacy'

	import { onMount } from 'svelte'
	import type { TippyInstance } from '$lib/fuma/utils/tippy.js'
	import debounce from 'debounce'
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'

	import { DropDown } from '$lib/fuma/ui/menu/index.js'
	import { InputNumber } from '$lib/fuma/ui/input/index.js'
	import { urlParam } from '$lib/fuma/store/param.js'
	import { jsonParse } from '$lib/fuma/utils/jsonParse.js'
	import type { TableField } from '$lib/fuma/ui/table/field.js'
	import { mdiFilterMultipleOutline, mdiSortAscending, mdiSortDescending } from '@mdi/js'
	import { Icon } from '$lib/fuma/ui/icon/index.js'
	import OrderButtons from '$lib/fuma/ui/table/head/OrderButtons.svelte'

	interface Props {
		field: TableField<Item>
	}

	let { field }: Props = $props()

	let tip: TippyInstance = $state()
	type Range = { min: number | undefined; max: number | undefined }

	let { min, max, order } = $state(initRange($page.url))
	onMount(() => page.subscribe(({ url }) => ({ min, max, order } = initRange(url))))

	function initRange({ searchParams }: URL) {
		return jsonParse<Range & { order?: 'asc' | 'desc' }>(searchParams.get(field.key), {
			min: undefined,
			max: undefined,
			order: undefined,
		})
	}

	const updateUrl = debounce(() => {
		if (isDefined(min) || isDefined(max) || order) {
			goto(
				$urlParam.with(
					{
						[field.key]: JSON.stringify({
							...(isDefined(min) ? { min } : {}),
							...(isDefined(max) ? { max } : {}),
							...(order ? { order } : {}),
						}),
					},
					'skip',
					'take'
				),
				{
					noScroll: true,
					keepFocus: true,
				}
			)
			return
		}
		goto($urlParam.without(field.key, 'skip', 'take'), { noScroll: true, keepFocus: true })
	}, 250)

	function handleReset() {
		min = undefined
		max = undefined
		tip.hide()
		goto($urlParam.without(field.key, 'skip', 'take'), { noScroll: true, keepFocus: true })
	}

	function isDefined(v: number | undefined | null): v is number {
		return typeof v === 'number'
	}

	let isNegatifRange = $derived(isDefined(min) && isDefined(max) && max < min)
</script>

<th class="p-1">
	<DropDown
		bind:tip
		hideOnBlur
		hideOnNav={false}
		autofocus
		tippyProps={{ appendTo: () => document.body }}
	>
		{#snippet activator()}
			<button class="menu-item min-h-8 w-full flex-wrap gap-y-1">
				<div class="flex gap-2">
					<span>{field.label}</span>
					{#if !isDefined(min) && !isDefined(max)}
						<Icon path={mdiFilterMultipleOutline} size={15} class="opacity-50" />
					{/if}
				</div>

				{#if isDefined(min) || isDefined(max)}
					<span class="badge badge-primary badge-xs text-[0.7rem] font-normal text-white">
						{#if isDefined(min)}
							{min} ≤
						{/if}
						x
						{#if isDefined(max)}
							≤ {max}
						{/if}
					</span>
				{/if}
				{#if order}
					<Icon
						path={order === 'asc' ? mdiSortAscending : mdiSortDescending}
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
					tip.hide()
				}}
			/>
			<div class="divider"></div>
			<span class="p-1 py-1 text-sm font-semibold opacity-70">Filtre:</span>
		{/if}
		<form class="grid grid-cols-2 gap-2 p-1" onsubmit={preventDefault(() => tip.hide())}>
			<InputNumber bind:value={min} on:input={updateUrl} input={{ placeholder: 'Min' }} />
			<InputNumber
				bind:value={max}
				on:input={updateUrl}
				hint={isNegatifRange ? 'Doit être plus grand' : ''}
				input={{ placeholder: 'Max' }}
			/>

			<div class="col-span-full flex justify-end gap-2">
				<button class="btn btn-ghost" type="button" onclick={handleReset}>Effacer</button>
				<button class="btn">Ok</button>
			</div>
		</form>
	</DropDown>
</th>
