<script lang="ts">
	import type { PageData } from './$types'

	export let data: PageData

	const toHour = (ms: number) => Math.round(ms / (1000 * 60 * 60))

</script>

{#if data.stats}
<div class="flex gap-4 items-start flex-wrap">
	<div class="stats bg-base-200 grow">
		<div class="stat">
			<div class="stat-title">Membres</div>
			<div class="stat-value">{data.members.length}</div>
		</div>
		<div class="stat">
			<div class="stat-title">Périodes</div>
			<div class="stat-value">{data.stats.nbSubscribes}/{data.stats.totalSlots}</div>
		</div>
		<div class="stat">
			<div class="stat-title">Heures</div>
			<div class="stat-value">
				{toHour(data.stats.nbSubscribesTime)}/{toHour(data.stats.totalSlotsTime)}</div>
		</div>
	</div>

	<div class="stats bg-base-200 grow items-start">
		{#each data.stats.summary as stat}
			<div class="stat">
				<div class="stat-title">{stat?.name}</div>
				<div class="stat-value text-sm">
					{#each Object.entries(stat?.distribution || {}) as [key, value]}
						<div class="stat-value text-sm">
							<span class="pr-1">{value}</span>
							{key}
						</div>
					{:else}
						<div class="stat-value text-sm">Aucun</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>

{/if}