<script lang="ts">
	import { urlParam } from 'fuma'
	import { ArrowDownIcon, ArrowUpIcon } from 'lucide-svelte'

	export let key: string

	$: currentSort = $urlParam.get('sort')
	$: currentOrder = $urlParam.get('order') || 'desc'

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
		<slot />
		{#if currentSort === key}
			{#if currentOrder === 'asc'}
				<ArrowUpIcon size={14} />
			{:else}
				<ArrowDownIcon size={14} />
			{/if}
		{/if}
	</a>
</td>
