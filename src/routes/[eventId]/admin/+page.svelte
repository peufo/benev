<script lang="ts">
	import { Size } from '@prisma/client'
	import { getAge } from '$lib/utils'
	import { eventPath } from '$lib/store'
	import { userSizeLabel } from '$lib/form'
	import Contact from '$lib/Contact.svelte'
	import PeriodPickerButton from '$lib/period/PeriodPickerButton.svelte'
	import { InputCheckboxsMenu, Card, Placeholder,  InputRadioButtons } from '$lib/material'
	import { rowLink } from '$lib/action'

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

<div class="grid md:grid-cols-2 gap-4">
	<Card>
		<span slot="title">Filtres</span>

		<div class="flex gap-4 flex-wrap">
			<PeriodPickerButton action="{$eventPath}/admin" />
			<InputCheckboxsMenu
				key="teams"
				label="Secteur sélectioné"
				labelPlurial="Secteurs sélectionés"
				options={data.teams.map((t) => ({ value: t.id, label: t.name }))}
				enhanceDisabled
			/>

			<InputRadioButtons
				key="member_type"
				options={{
					volunteers: 'Bénévoles',
					leaders: 'Responsable',
					all: 'Tous',
				}}
				bindWithParams
			/>

		</div>
	</Card>

	<Card>
		<span slot="title">Synthèse</span>

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
	</Card>

	<Card class="overflow-x-auto md:col-span-2">
		{#if data.members.length}
			<table class="table">
				<thead>
					<tr>
						<td>Bénévole</td>
						<td>Périodes</td>
						<td>Heures</td>
						<th>Secteurs à charge</th>
						<td>T-shirt</td>
						<td>Régime particulier</td>
						<td>Age</td>
					</tr>
				</thead>
				<tbody>
					{#each data.members as member}
						<tr use:rowLink={{href: `${$eventPath}/admin/members/${member.id}`}}>
							<td>{member.user.firstName} {member.user.lastName}</td>
							<td>
								<div class="badge badge-lg">
									{member.subscribes.length}
								</div>
							</td>
							<td>
								<div class="badge badge-lg">
									{toHour(workTimes[member.id])}
								</div>
							</td>

							<td>
								{#each member.leaderOf.map((team) => team.name) as team}
									<div class="badge badge-lg mr-1">
										{team}
									</div>
								{/each}
							</td>

							<td>{(member.user.size && userSizeLabel[member.user.size]) || '-'}</td>
							<td>{member.user.diet?.replaceAll(/[\[\]"]/g, '').replaceAll(',', ', ') || ''}</td>
							<td>{getAge(member.user.birthday)}</td>
							<td align="right" data-prepend>

								<Contact user={member.user} />
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{:else}
			<Placeholder>Aucun bénévole actif</Placeholder>
		{/if}
	</Card>
</div>
