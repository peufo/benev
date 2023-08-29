<script lang="ts">
	import { eventPath } from '$lib/store'
	import PeriodPickerButton from '$lib/period/PeriodPickerButton.svelte'
	import { InputCheckboxsMenu, Card, InputRadioButtons } from '$lib/material'
	import Members from './Members.svelte'

	export let data

	const stats = data.fields
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
					leaders: 'Responsables',
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

	<Members members={data.members} fields={data.fields} />
</div>
