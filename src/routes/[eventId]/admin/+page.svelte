<script lang="ts">
	import Contact from '$lib/Contact.svelte'
	import { userSizeLabel } from '$lib/form'
	import { eventPath } from '$lib/store'
	import { Size } from '@prisma/client'
	import { getAge } from '$lib/utils'
	import PeriodPickerButton from '$lib/period/PeriodPickerButton.svelte'
	import { InputCheckboxsMenu } from '$lib/material/input'

	export let data
	let workTimes: Record<string, number> = {}

	$: workTimes = data.members.reduce(
		(times, user) => ({
			...times,
			[user.id]: user.subscribes
				.filter(({ state }) => state === 'accepted' || state === 'request')
				.reduce((acc, { period }) => {
					const time = period.end.getTime() - period.start.getTime()
					return acc + time
				}, 0),
		}),
		{}
	)
	$: workTimeTotal = Object.values(workTimes).reduce((acc, cur) => acc + cur, 0)

	$: workTimeNeeded = data.members
		.map((u) => u.subscribes.map((s) => s.period))
		.flat()
		.reduce((acc, { start, end, maxSubscribe }) => {
			return acc + (end.getTime() - start.getTime()) * maxSubscribe
		}, 0)

	const toHour = (ms: number) => Math.round(ms / (1000 * 60 * 60))
	const sizeLabel = (key: string) => userSizeLabel[key as Size] || ''

	$: diet = data.members.reduce((acc, { user }) => {
		if (!user.diet) return acc
		const key = (JSON.parse(user.diet) as string[]).join(', ')
		if (acc[key]) return { ...acc, [key]: acc[key] + 1 }
		return { ...acc, [key]: 1 }
	}, {} as Record<string, number>)

	$: tshirt = data.members.reduce((acc, { user }) => {
		if (!user.size) return acc
		if (acc[user.size]) return { ...acc, [user.size]: acc[user.size] + 1 }
		return { ...acc, [user.size]: 1 }
	}, {} as Record<Size, number>)
</script>

<div class="flex gap-4 flex-wrap">
	<PeriodPickerButton action="{$eventPath}/admin" />
	<InputCheckboxsMenu
		key="teams"
		label="Secteur sélectioné"
		labelPlurial="Secteurs sélectionés"
		options={data.teams.map((t) => ({ value: t.id, label: t.name }))}
		enhanceDisabled
	/>
</div>

<div class="flex gap-4 items-start flex-wrap">
	<div class="stats bg-base-200 grow">
		<div class="stat">
			<div class="stat-title">Bénévoles</div>
			<div class="stat-value">{data.members.length}</div>
		</div>

		<div class="stat">
			<div class="stat-title">Heures</div>
			<div class="stat-value">
				{toHour(workTimeTotal)} / {toHour(workTimeNeeded)}
			</div>
		</div>
	</div>

	<div class="stats bg-base-200 grow items-start">
		<div class="stat">
			<div class="stat-title">T-shirts</div>
			<div class="stat-value text-sm">
				{#each Object.entries(tshirt) as [key, value]}
					<div class="stat-value text-sm">
						<span class="pr-1">{value}</span>
						{sizeLabel(key)}
					</div>
				{:else}
					Aucun
				{/each}
			</div>
		</div>

		<div class="stat">
			<div class="stat-title">Régimes particuliés</div>
			{#each Object.entries(diet) as [key, value]}
				<div class="stat-value text-sm">
					<span class="pr-1">{value}</span>
					{key}
				</div>
			{:else}
				<div class="stat-value text-sm">Aucun</div>
			{/each}
		</div>
	</div>
</div>

<div class="overflow-x-auto mt-8">
	<table class="table">
		<thead>
			<tr>
				<td>Bénévole</td>
				<td>Périodes</td>
				<td>Heures</td>
				<td>T-shirt</td>
				<td>Régime particulier</td>
				<td>Age</td>
			</tr>
		</thead>
		<tbody>
			{#each data.members as { user, subscribes }}
				<tr class="relative hover">
					<td>{user.firstName} {user.lastName}</td>
					<td>
						<div class="badge badge-lg">
							{subscribes.length}
						</div>
					</td>
					<td>
						<div class="badge badge-lg">
							{toHour(workTimes[user.id])}
						</div>
					</td>
					<td>{(user.size && userSizeLabel[user.size]) || '-'}</td>
					<td>{user.diet?.replaceAll(/[\[\]"]/g, '').replaceAll(',', ', ') || ''}</td>
					<td>{getAge(user.birthday)}</td>
					<td align="right">
						<a href="{$eventPath}/admin/members/{user.id}" class="absolute inset-0">{' '}</a>

						<Contact {user} />
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
