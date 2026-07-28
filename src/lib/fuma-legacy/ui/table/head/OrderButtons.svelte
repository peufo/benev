<script lang="ts">
	import { Icon } from '$lib/fuma-legacy/ui/icon/index.js'
	import { mdiSortAscending, mdiSortDescending } from '@mdi/js'

	type Order = 'asc' | 'desc' | undefined
	interface Props {
		order: Order
		iconAsc?: any
		iconDesc?: any
		/** Remplacent les évènements de la version Svelte 4. */
		onchange?: (value: Order) => void
	}

	let {
		order = $bindable(),
		iconAsc = mdiSortAscending,
		iconDesc = mdiSortDescending,
		onchange,
	}: Props = $props()

	const handleOrderClick = (orderBy: 'asc' | 'desc') => () => {
		if (order === orderBy) order = undefined
		else order = orderBy
		onchange?.(order)
	}
</script>

<div class="p-1 pt-2">
	<span class="text-sm font-semibold opacity-70">Ordre:</span>
	<div class="grid grid-cols-2 gap-2 pt-2">
		<button
			class="btn ring-primary"
			class:ring-2={order === 'asc'}
			onclick={handleOrderClick('asc')}
		>
			<Icon path={iconAsc} />
			<span>Ascendant</span>
		</button>
		<button
			class="btn ring-primary"
			class:ring-2={order === 'desc'}
			onclick={handleOrderClick('desc')}
		>
			<Icon path={iconDesc} />
			<span>Descendant</span>
		</button>
	</div>
</div>
