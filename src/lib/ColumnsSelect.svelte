<script lang="ts" context="module">
	export type Column<T extends Record<string, unknown>> = {
		label: string
		hint?: string
		getValue: (item: T) => string | number | boolean | string[]
	}
</script>

<script lang="ts">
	import { Icon, InputCheckboxsMenu } from 'fuma'
	import { mdiViewColumnOutline } from '@mdi/js'

	type Item = $$Generic<Record<string, unknown>>
	type _Column = Column<Item>

	export let columns: Record<string, _Column>

	export let selectedColumnsId: string[] = []
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
		<Icon path={mdiViewColumnOutline} title="Choix des colonnes" class="opacity-70" />
	</div>
</InputCheckboxsMenu>
