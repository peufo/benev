<script lang="ts">
	import { userSizeLabel } from '$lib/form'
	import { Icon } from '$lib/material'
	import { eventPath } from '$lib/store'
	import { mdiEmailOutline, mdiPhoneOutline } from '@mdi/js'
	import { Size } from '@prisma/client'
	import dayjs from 'dayjs'

	export let data

	const workTimes: Record<string, number> = data.users.reduce(
		(times, user) => ({
			...times,
			[user.id]: user.subscribes
				.filter(({ state }) => state === 'accepted' || state === 'request')
				.reduce((acc, { periodId }) => {
					const period = data.periods.find(({ id }) => id === periodId)
					if (!period) return acc
					const time = period.end.getTime() - period.start.getTime()
					return acc + time
				}, 0),
		}),
		{}
	)
	const workTimeTotal = Object.values(workTimes).reduce((acc, cur) => acc + cur, 0)

	const workTimeNeeded = data.periods.reduce((acc, { start, end, maxSubscribe }) => {
		return acc + (end.getTime() - start.getTime()) * maxSubscribe
	}, 0)

	const toHour = (ms: number) => Math.round(ms / (1000 * 60 * 60))

	const diet = data.users.reduce((acc, { diet }) => {
		if (!diet) return acc
		const key = (JSON.parse(diet) as string[]).join(', ')
		if (acc[key]) return { ...acc, [key]: acc[key] + 1 }
		return { ...acc, [key]: 1 }
	}, {} as Record<string, number>)

	const tshirt = data.users.reduce((acc, { size }) => {
		if (!size) return acc
		if (acc[size]) return { ...acc, [size]: acc[size] + 1 }
		return { ...acc, [size]: 1 }
	}, {} as Record<Size, number>)
	const sizeLabel = (key: string) => userSizeLabel[key as Size] || ''

	const day = dayjs()
	const getAge = (date: Date | null) => {
		if (!date) return '-'
		return day.diff(dayjs(date), 'year') + ' ans'
	}
</script>

<div>TODO: FILTRE PAR PERIODE</div>

<div class="flex gap-4 items-start flex-wrap">
	<div class="stats bg-base-200 grow">
		<div class="stat">
			<div class="stat-title">Bénévoles</div>
			<div class="stat-value">{data.users.length}</div>
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
				Aucun
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
			{#each data.users as user}
				<tr class="relative hover">
					<td>{user.firstName} {user.lastName}</td>
					<td>{user.subscribes.length}</td>
					<td>{toHour(workTimes[user.id])}</td>
					<td>{(user.size && userSizeLabel[user.size]) || '-'}</td>
					<td>{user.diet?.replaceAll(/[\[\]"]/g, '').replaceAll(',', ', ') || ''}</td>
					<td>{getAge(user.birthday)}</td>
					<td align="right">
						<a href="{$eventPath}/admin/users/{user.id}" class="absolute inset-0">{' '}</a>

						{#if user.phone}
							<a href="tel:{user.phone}" target="_blank" class="btn btn-square btn-sm relative">
								<Icon path={mdiPhoneOutline} title="Téléphoner à {user.firstName}" />
							</a>
						{/if}
						<a href="mailto:{user.email}" target="_blank" class="btn btn-square btn-sm relative">
							<Icon path={mdiEmailOutline} title="Envoyer un mail à {user.firstName}" />
						</a>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
