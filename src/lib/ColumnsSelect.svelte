<script lang="ts" context="module">
	export type Column<T extends Record<string, unknown>> = {
		label: string
		getValue: (item: T) => string | number | boolean | string[]
	}
</script>

<script lang="ts">
	import { Icon, InputCheckboxsMenu } from '$lib/material'
	import { page } from '$app/stores'
	import { jsonParse } from '$lib/jsonParse'
	import { mdiViewColumnOutline } from '@mdi/js'

	type Item = $$Generic<Record<string, unknown>>
	type _Column = Column<Item>

	export let columns: Record<string, _Column>
	export let defaultColumnsId: string[] = []

	export let selectedColumnsId = jsonParse<string[]>(
		$page.url.searchParams.get('columns'),
		defaultColumnsId
	)
	export let selectedColumns = getColumnsByIds(selectedColumnsId)
	$: selectedColumns = getColumnsByIds(selectedColumnsId)

	function getColumnsByIds(colIds: string[]): _Column[] {
		return colIds.map((colId) => columns[colId]).filter(Boolean)
	}
</script>

<InputCheckboxsMenu
	key="columns"
	bind:value={selectedColumnsId}
	label="Colonnes"
	options={columns}
	right
	enhanceDisabled
	btnClass="btn-square"
>
	<div slot="label" class="contents">
		<Icon
			path={mdiViewColumnOutline}
			title="Choix des colonnes"
			tippyProps={{ placement: 'left' }}
		/>
	</div>
</InputCheckboxsMenu>
