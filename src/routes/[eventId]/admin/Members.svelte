<script lang="ts">
	import { getAge } from '$lib/utils'
	import { eventPath } from '$lib/store'
	import { rowLink } from '$lib/action'
	import { userSizeLabel } from '$lib/form'

	import { Field, Member, Period, Subscribe, Team, User } from '@prisma/client'
	import { Card, InputCheckboxsMenu, Placeholder } from '$lib/material'
	import Contact from '$lib/Contact.svelte'

	export let members: (Member & {
		user: User
		leaderOf: Team[]
		subscribes: (Subscribe & { period: Period })[]
	})[]

	export let fields: Field[]

	const toHour = (ms: number) => Math.round(ms / (1000 * 60 * 60))
	let workTimes: Record<string, number> = {}
	$: workTimes = members.reduce(
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
</script>

<Card class="overflow-x-hidden md:col-span-2">
	<span slot="title">Bénévoles</span>

	<div slot="action">
		<InputCheckboxsMenu
			key="fields"
			label="Champ visible"
			labelPlurial="Champs visibles"
			options={[
				{ value: 'periods', label: 'Périodes' },
				{ value: 'hours', label: 'Heures' },
				{ value: 'sectors', label: 'Secteurs à charges' },
				{ value: 'age', label: 'Age' },
				...fields.map((f) => ({ value: f.name, label: f.name })),
			]}
			right
			enhanceDisabled
		/>
	</div>

	<div class="w-full overflow-x-auto">
		{#if members.length}
			<table class="table table-pin-rows">
				<thead>
					<tr>
						<td>Nom</td>
						<td>Périodes</td>
						<td>Heures</td>
						<th>Secteurs à charge</th>
						<td>T-shirt</td>
						<td>Régime particulier</td>
						<td>Age</td>
					</tr>
				</thead>
				<tbody>
					{#each members as member}
						<tr use:rowLink={{ href: `${$eventPath}/admin/members/${member.id}` }}>
							<td>{member.user.firstName} {member.user.lastName}</td>
							<td>
								<div class="badge">
									{member.subscribes.length}
								</div>
							</td>
							<td>
								<div class="badge">
									{toHour(workTimes[member.id])}
								</div>
							</td>

							<td>
								{#each member.leaderOf.map((team) => team.name) as team}
									<div class="badge badge-sm mr-1 whitespace-nowrap">
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
	</div>
</Card>
