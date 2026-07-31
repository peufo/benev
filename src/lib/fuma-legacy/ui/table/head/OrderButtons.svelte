<script lang="ts">
	import { ArrowDownWideNarrowIcon, ArrowUpNarrowWideIcon, type IconProps } from '@lucide/svelte'
	import type { Component } from 'svelte'

	type Order = 'asc' | 'desc' | undefined
	interface Props {
		order: Order
		iconAsc?: Component<IconProps>
		iconDesc?: Component<IconProps>
		/** Remplacent les évènements de la version Svelte 4. */
		onchange?: (value: Order) => void
	}

	let {
		order = $bindable(),
		iconAsc: IconAsc = ArrowUpNarrowWideIcon,
		iconDesc: IconDesc = ArrowDownWideNarrowIcon,
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
			<IconAsc size={20} />
			<span>Ascendant</span>
		</button>
		<button
			class="btn ring-primary"
			class:ring-2={order === 'desc'}
			onclick={handleOrderClick('desc')}
		>
			<IconDesc size={20} />
			<span>Descendant</span>
		</button>
	</div>
</div>
