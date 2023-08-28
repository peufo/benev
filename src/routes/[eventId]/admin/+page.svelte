<script lang="ts">
	import { Size } from '@prisma/client'

	import { eventPath } from '$lib/store'
	import { userSizeLabel } from '$lib/form'

	import PeriodPickerButton from '$lib/period/PeriodPickerButton.svelte'
	import { InputCheckboxsMenu, Card, InputRadioButtons } from '$lib/material'

	import Members from './Members.svelte'

	export let data
	let workTimes: Record<string, number> = {}

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
				labelDefault="Tous les secteurs"
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

	<Members members={data.members} fields={data.fields} />
</div>
