<script lang="ts">
	import type { Team, Field, FieldType } from '@prisma/client'
	import type { TeamCondition, TeamConditionOperator } from '$lib/validation'
	import { jsonParse } from '$lib/jsonParse'
	import { Icon, InputSelect, Placeholder } from '$lib/material'
	import {
		mdiAccountCheckOutline,
		mdiCardAccountDetailsOutline,
		mdiClose,
		mdiContain,
		mdiHumanMaleBoy,
		mdiPlus,
	} from '@mdi/js'
	import InputNumber from '$lib/material/input/InputNumber.svelte'

	export let team: Team | undefined
	export let memberFields: Field[]

	let conditions = jsonParse<TeamCondition[]>(team?.conditions, [])
	$: addConditionOptions = {
		...(!conditions.find((c) => c.type === 'valided') && { valided: 'Membre aprouvé' }),
		...(!conditions.find((c) => c.type === 'age') && { age: 'Âge minimum' }),
		profile: 'Profil du membre',
	}

	function handleAddCondition(event: { detail: string }) {
		const _type = event.detail as TeamCondition['type']
		if (_type === 'valided') conditions = [...conditions, { type: 'valided' }]
		if (_type === 'age') conditions = [...conditions, { type: 'age', args: '18' }]
		if (_type === 'profile')
			conditions = [
				...conditions,
				{
					type: 'profile',
					args: {
						fieldId: '',
						operator: 'is',
					},
				},
			]
	}

	const operators: Record<FieldType, TeamConditionOperator[]> = {
		boolean: ['is'],
		number: ['is', 'gt', 'gte', 'lt', 'lte'],
		string: ['is', 'not', 'contains', 'notContains'],
		textarea: ['is', 'not', 'contains', 'notContains'],
		select: ['haveAny'],
		multiselect: ['is', 'haveAny'],
	}
</script>

<div>
	<input type="hidden" name="conditions" value={JSON.stringify(conditions)} />
	<div class="flex items-center mb-2">
		<h3 class="text-lg font-medium opacity-75 grow">Conditions</h3>
		<InputSelect options={addConditionOptions} on:select={handleAddCondition} btnClass="btn-square">
			<svelte:fragment slot="btn">
				<Icon path={mdiPlus} title="Ajouter une condition" />
			</svelte:fragment>
		</InputSelect>
	</div>

	<div class="flex flex-col gap-2">
		{#each conditions as condition, index}
			<div class="flex gap-2 items-center bg-base-200/40 border rounded p-2">
				{#if condition.type === 'valided'}
					<Icon path={mdiAccountCheckOutline} class="opacity-70" />
					<div class="label">
						<span class="label-text">Membre approuvé</span>
					</div>
				{:else if condition.type === 'age'}
					<Icon path={mdiHumanMaleBoy} class="opacity-70" />
					<InputNumber bind:value={condition.args} label="Âge minimum" class="grid grid-cols-2" />
				{:else}
					<Icon path={mdiCardAccountDetailsOutline} class="opacity-70" />
					<InputSelect
						bind:value={condition.args.fieldId}
						options={memberFields.map((f) => ({ value: f.id, label: f.name }))}
						noBtnClass
						class="label-text hover:bg-base-300 p-2 pl-1 rounded"
						on:select={(e) => {
							const field = memberFields.find((f) => f.id === e.detail)
							if (!field) return
							if (condition.type !== 'profile') return
							if (operators[field.type].includes(condition.args.operator)) return
							condition.args.operator = operators[field.type][0]
						}}
					>
						<svelte:fragment slot="placeholder">Sélectioner un champ</svelte:fragment>
					</InputSelect>

					{#if condition.args.fieldId}
						{@const fieldId = condition.args.fieldId}
						{@const field = memberFields.find((f) => f.id === fieldId)}

						{#if field}
							<InputSelect
								bind:value={condition.args.operator}
								options={operators[field.type]}
								noBtnClass
								btnClass="label-text hover:bg-base-300 px-3 py-2 rounded"
							/>
						{/if}
					{/if}
				{/if}

				<button
					type="button"
					class="btn btn-square btn-sm ml-auto"
					on:click={() =>
						(conditions = [...conditions.slice(0, index), ...conditions.slice(index + 1)])}
				>
					<Icon path={mdiClose} class="opacity-70" />
				</button>
			</div>
		{:else}
			<Placeholder style="height: 80px;">Pas de conditions d'inscription</Placeholder>
		{/each}
	</div>
</div>
