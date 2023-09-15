<script lang="ts">
	import { Card } from '$lib/material'
	import { record } from 'zod'
	import Members from './Members.svelte'

	export let data

	$: stats = data.fields
		.map((field) => {
			if (field.type === 'select' || field.type === 'multiselect') {
				return {
					name: field.name,
					distribution: data.members.reduce((acc, { profile }) => {
						const { value } = profile.find((v) => v.fieldId === field.id) || { value: '' }
						if (!value) return acc
						const key =
							field.type === 'select'
								? value
								: value.replaceAll(/[\[\"\]]/g, '').replaceAll(',', ', ')
						if (!key) return acc
						if (acc[key]) return { ...acc, [key]: acc[key] + 1 }
						return { ...acc, [key]: 1 }
					}, {} as Record<string, number>),
				}
			}
		})
		.filter(Boolean)

	$: totalSlots = data.periods.reduce((acc, cur) => acc + cur.maxSubscribe, 0)
	$: totalSubscribes = data.members.reduce((acc, cur) => acc + cur.subscribes.length, 0)
	let workTimes: Record<string, number>
	$: workTimes = data.members.reduce(
		(times, user) => ({
			...times,
			[user.id]: user.subscribes.reduce((acc, { period }) => {
				const time = period.end.getTime() - period.start.getTime()
				return acc + time
			}, 0),
		}),
		{}
	)

	const toHour = (ms: number) => Math.round(ms / (1000 * 60 * 60))
	$: totalSubscribesHours = toHour(Object.values(workTimes).reduce((acc, cur) => acc + cur, 0))
	$: totalSlotsHours = toHour(
		data.periods.reduce(
			(acc, cur) => acc + cur.maxSubscribe * (cur.end.getTime() - cur.start.getTime()),
			0
		)
	)
</script>

<div class="flex flex-col gap-4">
	<Card>
		<span slot="title">Synthèse</span>

		<div class="flex gap-4 items-start flex-wrap">
			<div class="stats bg-base-200 grow">
				<div class="stat">
					<div class="stat-title">Bénévoles</div>
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
	</Card>

	<Members members={data.members} fields={data.fields} teams={data.teams} {workTimes} />
</div>
