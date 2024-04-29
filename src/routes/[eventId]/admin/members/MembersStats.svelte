<script lang="ts">
	import { CardBasic } from 'fuma'
	import type { PageData } from './$types'
	import { urlParam } from '$lib/store'

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
					{@const fieldKey = `field_${stat.fieldId}`}
					{@const distribution = Object.entries(stat.distribution)}
					{@const total = distribution
						.map(([key, value]) => value)
						.reduce((acc, cur) => acc + cur, 0)}

					<CardBasic title={stat.fieldName} class="grow">
						<div
							class="grid gap-2 text-sm items-center"
							style:grid-template-columns="min-content auto"
						>
							{#each distribution as [key, value]}
								{@const fieldValue = stat.fieldType === 'multiselect' ? JSON.stringify([key]) : key}

								<span class="text-right font-medium">{value}</span>
								<a
									class="relative menu-item"
									data-sveltekit-replacestate
									href={$urlParam.with({ [fieldKey]: fieldValue }, 'skip', 'take', 'summary')}
								>
									<span class="z-10"
										>{stat.fieldType !== 'boolean' ? key : key === 'true' ? 'Oui' : 'Non'}</span
									>
									<div
										class="absolute bg-primary/10 bottom-0 top-0 left-0 rounded"
										style:width="{(value / total) * 100}%"
									/>
								</a>
							{:else}
								<div class="col-span-2">Aucun</div>
							{/each}
						</div>
					</CardBasic>
				{/if}
			{/each}
		</div>
	</div>
{/if}
