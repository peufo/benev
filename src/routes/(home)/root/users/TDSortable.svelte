<script lang="ts">
	import { urlParam } from '$lib/fuma'
	import { ArrowDownIcon, ArrowUpIcon } from '@lucide/svelte'

	interface Props {
		key: string;
		children?: import('svelte').Snippet;
	}

	let { key, children }: Props = $props();

	let currentSort = $derived($urlParam.get('sort'))
	let currentOrder = $derived($urlParam.get('order') || 'desc')

	function getSortUrl(sort: string | null, order: string | null) {
		if (sort !== key) return $urlParam.with({ sort: key, order: 'desc' })
		if (order === 'desc') return $urlParam.with({ sort: key, order: 'asc' })
		return $urlParam.without('sort', 'order')
	}
</script>

<td>
	<a
		href={getSortUrl(currentSort, currentOrder)}
		class="inline-flex items-center gap-1 link link-hover"
	>
		{@render children?.()}
		{#if currentSort === key}
			{#if currentOrder === 'asc'}
				<ArrowUpIcon size={14} />
			{:else}
				<ArrowDownIcon size={14} />
			{/if}
		{/if}
	</a>
</td>
