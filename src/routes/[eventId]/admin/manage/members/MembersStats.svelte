<script lang="ts">
	import type { PageData } from './$types'

	export let data: PageData
	export let workTimes: Record<string, number>

	$: stats = data.fields
		.map((field) => {
			if (field.type === 'select' || field.type === 'multiselect') {
				return {
					name: field.name,
					distribution: data.members.reduce((acc, { profile }) => {
						const { value } = profile.find((v) => v.fieldId === field.id) || { value: '' }
						if (!value) return acc
						const keys =
							field.type === 'select'
								? [value]
								: field.allCombinations
								? [value.replaceAll(/[\[\"\]]/g, '').replaceAll(',', ', ')]
								: (JSON.parse(value) as string[])

						keys.forEach((key) => {
							if (!key) return
							if (acc[key]) return (acc = { ...acc, [key]: acc[key] + 1 })
							acc = { ...acc, [key]: 1 }
						})
						return acc
					}, {} as Record<string, number>),
				}
			}
		})
		.filter(Boolean)

	$: totalSlots = data.periods.reduce((acc, cur) => acc + cur.maxSubscribe, 0)
	$: totalSubscribes = data.members.reduce((acc, cur) => acc + cur.subscribes.length, 0)

	const toHour = (ms: number) => Math.round(ms / (1000 * 60 * 60))
	$: totalSubscribesHours = toHour(Object.values(workTimes).reduce((acc, cur) => acc + cur, 0))
	$: totalSlotsHours = toHour(
		data.periods.reduce(
			(acc, cur) => acc + cur.maxSubscribe * (cur.end.getTime() - cur.start.getTime()),
			0
		)
	)
</script>

<div class="flex gap-4 items-start flex-wrap">
	<div class="stats bg-base-200 grow">
		<div class="stat">
			<div class="stat-title">Membres</div>
			<div class="stat-value">{data.members.length}</div>
		</div>
		<div class="stat">
			<div class="stat-title">Périodes</div>
			<div class="stat-value">{totalSubscribes}/{totalSlots}</div>
		</div>
		<div class="stat">
			<div class="stat-title">Heures</div>
			<div class="stat-value">{totalSubscribesHours}/{totalSlotsHours}</div>
		</div>
	</div>

	<div class="stats bg-base-200 grow items-start">
		{#each stats as stat}
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
