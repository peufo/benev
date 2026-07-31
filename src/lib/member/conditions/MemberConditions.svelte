<script lang="ts">
	import { IdCardIcon, PersonStandingIcon, PlusIcon, UserCheckIcon, XIcon } from '@lucide/svelte'
	import { run } from 'svelte/legacy'

	import axios from 'axios'
	import { get } from 'svelte/store'
	import { page } from '$app/stores'
	import type { Field } from '@prisma/client'
	import {
		InputSelect,
		Placeholder,
		DropDownMenu,
		InputNumber,
		InputText,
		InputCheckboxs,
		InputRadio,
		component,
		type ComponentAndProps,
	} from '$lib/fuma-legacy'
	import { jsonParse, tip } from 'fuma'
	import { browser } from '$app/environment'
	import type { MemberCondition } from '$lib/models'
	import { CONDITION_OPERATOR, CONDITION_OPERATOR_LABEL } from './constants'

	interface Props {
		conditions?: MemberCondition[]
		memberFields: Field[]
	}

	let { conditions = $bindable([]), memberFields }: Props = $props()
	let memberAllowedCount = $state(0)

	async function getmemberAllowedCount() {
		if (!conditions.length || !browser) return
		try {
			const { params } = get(page)
			const conditionsParam = encodeURIComponent(JSON.stringify(conditions))
			const res = await axios.get<number>(
				`/${params.eventId}/teams/membersAllowed?conditions=${conditionsParam}`
			)
			memberAllowedCount = res.data
		} catch (err) {
			console.error(err)
		}
	}

	function handleAddCondition(value: string) {
		const _type = value as MemberCondition['type']
		if (_type === 'valided') conditions = [...conditions, { type: 'valided' }]
		if (_type === 'age') conditions = [...conditions, { type: 'age', args: 18 }]
		if (_type === 'profile')
			conditions = [
				...conditions,
				{
					type: 'profile',
					args: {
						fieldId: '',
						operator: 'equals',
						expectedValue: '',
					},
				},
			]
	}

	function getFieldInput(field: Field): ComponentAndProps {
		if (field.type === 'boolean')
			return component(InputRadio, {
				label: '',
				key: field.id,
				options: { true: 'Oui', false: 'Non' },
			})
		if (field.type === 'string' || field.type === 'textarea') return component(InputText, {})
		if (field.type === 'number') return component(InputNumber, {})
		return component(InputCheckboxs, {
			label: '',
			key: field.id,
			options: jsonParse(field.options, []),
		})
	}
	run(() => {
		if (conditions) getmemberAllowedCount()
	})
	let addConditionOptions = $derived({
		...(!conditions.find((c) => c.type === 'valided') && { valided: 'Membre approuvé' }),
		...(!conditions.find((c) => c.type === 'age') && { age: 'Âge minimum' }),
		profile: 'Profil du membre',
	})
</script>

<div class="mt-4">
	<input type="hidden" name="conditions" value={JSON.stringify(conditions)} />
	<div class="flex items-center mb-2">
		<div class="grow">
			<div class="label flex-col items-start">
				<span class="label-text">Conditions</span>
				<span class="label-text-alt opacity-80">
					Visible pour
					{#if !conditions.length}
						tous les membres
					{:else}
						{memberAllowedCount} membre{memberAllowedCount > 1 ? 's' : ''}
					{/if}
				</span>
			</div>
		</div>
		<DropDownMenu
			options={addConditionOptions}
			onselect={handleAddCondition}
			tippyProps={{ placement: 'bottom-end' }}
		>
			<button type="button" class="btn btn-square">
				<span class="inline-flex" use:tip={{ content: 'Ajouter une condition' }}><PlusIcon /></span>
			</button>
		</DropDownMenu>
	</div>

	<div class="flex flex-col gap-2">
		{#each conditions as condition, index (index)}
			<div class="flex flex-col gap-2 bg-base-200/40 border rounded p-2">
				<div class="flex gap-2 items-center">
					{#if condition.type === 'valided'}
						<UserCheckIcon class="opacity-70" />
						<div class="label">
							<span class="label-text">Membre approuvé</span>
						</div>
					{:else if condition.type === 'age'}
						<PersonStandingIcon class="opacity-70" />
						<InputNumber
							bind:value={condition.args}
							label="Âge minimum"
							class="grid grid-cols-2"
							input={{ min: 1 }}
						/>
					{:else}
						<IdCardIcon class="opacity-70" />

						<div class="flex flex-wrap gap-2">
							<!-- SELECT FIELD -->
							<InputSelect
								bind:value={condition.args.fieldId}
								options={memberFields.map((f) => ({ value: f.id, label: f.name }))}
								class="label-text whitespace-nowrap"
								placeholder="Sélectioner un champ"
								onselect={(fieldId) => {
									const field = memberFields.find((f) => f.id === fieldId)
									if (!field) return
									if (condition.type !== 'profile') return
									if (CONDITION_OPERATOR[field.type].includes(condition.args.operator)) return
									condition.args.operator = CONDITION_OPERATOR[field.type][0]
								}}
							/>

							<!-- SELECT OPERATOR -->
							{#if condition.args.fieldId}
								{@const fieldId = condition.args.fieldId}
								{@const field = memberFields.find((f) => f.id === fieldId)}
								{#if field}
									<InputSelect
										bind:value={condition.args.operator}
										options={CONDITION_OPERATOR[field.type].map((value) => ({
											value,
											label: CONDITION_OPERATOR_LABEL[value],
										}))}
										class="label-text whitespace-nowrap"
									/>
								{/if}
							{/if}
						</div>
					{/if}

					<button
						type="button"
						class="btn btn-square btn-sm ml-auto"
						onclick={() =>
							(conditions = [...conditions.slice(0, index), ...conditions.slice(index + 1)])}
					>
						<XIcon class="opacity-70" />
					</button>
				</div>

				{#if condition.type === 'profile' && condition.args.fieldId}
					{@const fieldId = condition.args.fieldId}
					{@const field = memberFields.find((f) => f.id === fieldId)}
					{#if field}
						{@const { component, props } = getFieldInput(field)}
						{@const SvelteComponent = component}
						<SvelteComponent {...props} bind:value={condition.args.expectedValue} />
					{/if}
				{/if}
			</div>
		{:else}
			<Placeholder style="height: 80px;">Pas de conditions d'inscription</Placeholder>
		{/each}
	</div>
</div>
