<script lang="ts" generics="Item extends {id: string}">
	import { createBubbler, preventDefault } from 'svelte/legacy'

	const bubble = createBubbler()
	import {
		mdiCheck,
		mdiCheckCircleOutline,
		mdiCircleSmall,
		mdiDotsHorizontal,
		mdiDrag,
		mdiPlus,
	} from '@mdi/js'
	import type { TippyInstance } from 'fuma'
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { urlParam } from 'fuma'
	import { listEditable } from 'fuma'
	import { jsonParse } from 'fuma'
	import { context } from '$lib/fuma-legacy/ui/table/context.js'
	import { Icon } from '$lib/fuma-legacy/ui/icon/index.js'
	import { DropDown } from 'fuma'
	import type { TableField } from '$lib/fuma-legacy/ui/table/index.js'

	interface Props {
		fields: TableField<Item>[]
		key: string
		onCreateField?: (() => void) | undefined
	}

	let { fields = $bindable(), key, onCreateField = undefined }: Props = $props()

	let tip: TippyInstance = $state()!

	const { KEY_FIELDS_VISIBLE, KEY_FIELDS_HIDDEN, KEY_FIELDS_ORDER } = context.get(key)

	function getFieldHref(field: TableField<Item>) {
		if (field.locked) return
		const url = toggleParam(field.visible ? KEY_FIELDS_HIDDEN : KEY_FIELDS_VISIBLE, field.key)
		if (url.searchParams.has(field.key)) {
			url.searchParams.delete(field.key)
			url.searchParams.delete('skip')
			url.searchParams.delete('take')
		}
		return url.pathname + url.search
	}

	function toggleParam(paramKey: string, fieldKey: string): URL {
		const url = new URL($page.url)
		const fieldsKeys = jsonParse<string[]>($page.url.searchParams.get(paramKey), [])
		if (!fieldsKeys.includes(fieldKey)) fieldsKeys.push(fieldKey)
		else fieldsKeys.splice(fieldsKeys.indexOf(fieldKey), 1)

		if (fieldsKeys.length) url.searchParams.set(paramKey, JSON.stringify(fieldsKeys))
		else url.searchParams.delete(paramKey)

		return url
	}

	function handleReorder(newFieldsOrder: TableField<Item>[]) {
		fields = newFieldsOrder
		const fieldsOrder = fields.map((f) => f.key)
		const newUrl = urlParam.with({ [KEY_FIELDS_ORDER]: JSON.stringify(fieldsOrder) })
		goto(newUrl, { replaceState: true, noScroll: true, keepFocus: true })
	}
</script>

<th class="sticky right-0 z-10 p-0 px-1" align="right">
	<DropDown
		bind:tip
		hideOnNav={false}
		class="max-h-none px-0"
		tippyProps={{ appendTo: () => document.body, placement: 'bottom-end' }}
	>
		{#snippet activator()}
			<button type="button" class="btn btn-square btn-ghost btn-sm backdrop-blur">
				<Icon path={mdiDotsHorizontal} title="Définir les champs" />
			</button>
		{/snippet}

		{#if onCreateField}
			<div class="bordered flex items-center gap-2 border-b pb-1 pl-2 pr-1">
				<span class=" font-semibold opacity-70">Champs</span>
				<button
					type="button"
					class="btn btn-square btn-sm ml-auto"
					onclick={() => {
						if (onCreateField) onCreateField()
						tip.hide()
					}}
				>
					<Icon path={mdiPlus} title="Ajouter un champ" />
				</button>
			</div>
		{/if}

		<div class="max-h-[500px] overflow-auto px-1 pt-1">
			<div
				use:listEditable={{
					items: fields,
					onChange: handleReorder,
					dragElementsSelector: '.drag-button',
				}}
			>
				{#each fields as field (field.key)}
					<a
						draggable="false"
						href={getFieldHref(field)}
						class="menu-item w-full"
						class:disabled={field.locked}
						data-sveltekit-keepfocus
						data-sveltekit-replacestate
						data-sveltekit-noscroll
					>
						{#if field.locked}
							<Icon path={mdiCheck} class="fill-base-content/50" size={21} />
						{:else if urlParam.has(field.key)}
							<Icon path={mdiCheckCircleOutline} class="fill-primary" size={21} />
						{:else if field._visible}
							<Icon path={mdiCheck} class="fill-success" size={21} />
						{:else}
							<Icon path={mdiCircleSmall} class="fill-base-content/50" size={21} />
						{/if}

						<span>{field.label}</span>

						<span
							class="drag-button btn btn-square btn-ghost btn-xs ml-auto"
							onclick={preventDefault(bubble('click'))}
							role="none"
						>
							<Icon path={mdiDrag} size={18} class="fill-base-content/80" />
						</span>
					</a>
				{/each}
			</div>
		</div>
	</DropDown>
</th>
