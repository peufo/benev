<script lang="ts">
	import axios from 'axios'
	import type { ComponentProps, ComponentType } from 'svelte'
	import { get } from 'svelte/store'
	import { page } from '$app/stores'
	import type { Field } from '@prisma/client'
	import {
		Icon,
		InputSelect,
		Placeholder,
		DropDownMenu,
		InputNumber,
		InputText,
		InputCheckboxs,
		InputRadio,
		jsonParse,
	} from 'fuma'
	import {
		mdiAccountCheckOutline,
		mdiCardAccountDetailsOutline,
		mdiClose,
		mdiHumanMaleBoy,
		mdiPlus,
	} from '@mdi/js'
	import { browser } from '$app/environment'
	import type { MemberCondition } from '$lib/models'
	import { CONDITION_OPERATOR, CONDITION_OPERATOR_LABEL } from './constants'

	export let conditions: MemberCondition[] = []
	export let memberFields: Field[]
	let memberAllowedCount = 0

	$: if (conditions) getmemberAllowedCount()

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

	$: addConditionOptions = {
		...(!conditions.find((c) => c.type === 'valided') && { valided: 'Membre approuvé' }),
		...(!conditions.find((c) => c.type === 'age') && { age: 'Âge minimum' }),
		profile: 'Profil du membre',
	}

	function handleAddCondition(event: { detail: string }) {
		const _type = event.detail as MemberCondition['type']
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

	function component<Component extends ComponentType>(
		component: Component,
		props: ComponentProps<InstanceType<Component>>
	) {
		return { component, props }
	}
	function getFieldInput(field: Field): ReturnType<typeof component> {
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
			on:select={handleAddCondition}
			tippyProps={{ placement: 'bottom-end' }}
		>
			<button type="button" class="btn btn-square">
				<Icon path={mdiPlus} title="Ajouter une condition" />
			</button>
		</DropDownMenu>
	</div>

	<div class="flex flex-col gap-2">
		{#each conditions as condition, index}
			<div class="flex flex-col gap-2 bg-base-200/40 border rounded p-2">
				<div class="flex gap-2 items-center">
					{#if condition.type === 'valided'}
						<Icon path={mdiAccountCheckOutline} class="opacity-70" />
						<div class="label">
							<span class="label-text">Membre approuvé</span>
						</div>
					{:else if condition.type === 'age'}
						<Icon path={mdiHumanMaleBoy} class="opacity-70" />
						<InputNumber
							bind:value={condition.args}
							label="Âge minimum"
							class="grid grid-cols-2"
							input={{ min: 1 }}
						/>
					{:else}
						<Icon path={mdiCardAccountDetailsOutline} class="opacity-70" />

						<div class="flex flex-wrap gap-2">
							<!-- SELECT FIELD -->
							<InputSelect
								bind:value={condition.args.fieldId}
								options={memberFields.map((f) => ({ value: f.id, label: f.name }))}
								class="label-text whitespace-nowrap"
								placeholder="Sélectioner un champ"
								on:select={(e) => {
									const field = memberFields.find((f) => f.id === e.detail)
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
						on:click={() =>
							(conditions = [...conditions.slice(0, index), ...conditions.slice(index + 1)])}
					>
						<Icon path={mdiClose} class="opacity-70" />
					</button>
				</div>

				{#if condition.type === 'profile' && condition.args.fieldId}
					{@const fieldId = condition.args.fieldId}
					{@const field = memberFields.find((f) => f.id === fieldId)}
					{#if field}
						{@const { component, props } = getFieldInput(field)}
						<svelte:component
							this={component}
							{...props}
							bind:value={condition.args.expectedValue}
						/>
					{/if}
				{/if}
			</div>
		{:else}
			<Placeholder style="height: 80px;">Pas de conditions d'inscription</Placeholder>
		{/each}
	</div>
</div>
