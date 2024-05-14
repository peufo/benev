<script lang="ts">
	import { CardBasic } from 'fuma'
	import type { PageData } from './$types'
	import { urlParam } from '$lib/store'
	import Distribution from './Distribution.svelte'

	export let data: PageData

	const toHour = (ms: number) => Math.round(ms / (1000 * 60 * 60))
</script>

{#if data.stats}
	<div class="flex flex-col gap-4">
		<div class="stats bg-base-200 grow">
			<div class="stat">
				<div class="stat-title">Membres</div>
				<div class="stat-value">{data.stats.nbMembers}</div>
			</div>
			<div class="stat">
				<div class="stat-title">Périodes</div>
				<div class="stat-value">{data.stats.nbSubscribes}/{data.stats.totalSlots}</div>
			</div>
			<div class="stat">
				<div class="stat-title">Heures</div>
				<div class="stat-value">
					{toHour(data.stats.nbSubscribesTime)}/{toHour(data.stats.totalSlotsTime)}
				</div>
			</div>
		</div>

		<div class="flex gap-4 flex-wrap justify-start items-start">
			{#each data.stats.summary as stat}
				{#if stat}
					<Distribution
						title={stat.fieldName}
						values={stat.distribution}
						class="grow"
						getLabel={(key) => {
							if (stat?.fieldType !== 'boolean') return key
							return key === 'true' ? 'Oui' : 'Non'
						}}
						getHref={(key) => {
							const fieldValue = stat?.fieldType === 'multiselect' ? JSON.stringify([key]) : key
							const k = `field_${stat.fieldId}`
							return $urlParam.with({ [k]: fieldValue }, 'skip', 'take', 'summary')
						}}
					/>
				{/if}
			{/each}
		</div>
	</div>
{/if}
