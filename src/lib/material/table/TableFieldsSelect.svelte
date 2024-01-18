<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { urlParam } from '$lib/store'
	import { listEditable } from '$lib/action'
	import { jsonParse } from '$lib/jsonParse'
	import {
		mdiCheck,
		mdiCheckCircleOutline,
		mdiCircleSmall,
		mdiDotsHorizontal,
		mdiDrag,
	} from '@mdi/js'
	import { Icon, DropDown, type TableField } from '$lib/material'
	import { context } from '$lib/material/table'

	type Item = $$Generic<{ id: string }>
	export let fields: TableField<Item>[]
	export let key: string

	const { KEY_FIELDS_VISIBLE, KEY_FIELDS_HIDDEN, KEY_FIELDS_ORDER } = context.get(key)

	function getFieldHref(field: TableField) {
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
		const newUrl = $urlParam.with({ [KEY_FIELDS_ORDER]: JSON.stringify(fieldsOrder) })
		goto(newUrl, { replaceState: true, noScroll: true, keepFocus: true })
	}

	let scrollContainer: HTMLDivElement
</script>

<th class="p-0 px-1 sticky right-0 z-10" align="right">
	<DropDown
		hideOnNav={false}
		class="max-h-[500px] scroll-container"
		tippyProps={{ appendTo: () => document.body, placement: 'bottom-end' }}
		bind:content={scrollContainer}
	>
		<button slot="activator" type="button" class="btn btn-sm btn-square btn-ghost backdrop-blur">
			<Icon path={mdiDotsHorizontal} title="Définir les champs" />
		</button>

		<div
			use:listEditable={{
				items: fields,
				onChange: handleReorder,
				dragElementsSelector: '.drag-button',
				scrollContainersSelector: '.scroll-container',
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
					{:else if $urlParam.has(field.key)}
						<Icon path={mdiCheckCircleOutline} class="fill-primary" size={21} />
					{:else if field.$visible}
						<Icon path={mdiCheck} class="fill-success" size={21} />
					{:else}
						<Icon path={mdiCircleSmall} class="fill-base-content/50" size={21} />
					{/if}

					<span>{field.label}</span>

					<span
						class="drag-button btn btn-xs btn-square btn-ghost ml-auto"
						on:click|preventDefault
						role="none"
					>
						<Icon path={mdiDrag} size={18} class="fill-base-content/80" />
					</span>
				</a>
			{/each}
		</div>
	</DropDown>
</th>
