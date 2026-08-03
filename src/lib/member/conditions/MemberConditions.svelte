<script lang="ts">
	import { IdCardIcon, PersonStandingIcon, PlusIcon, UserCheckIcon, XIcon } from '@lucide/svelte'

	import axios from 'axios'
	import { get } from 'svelte/store'
	import { page } from '$app/stores'
	import type { Field } from '@prisma/client'
	import { Placeholder } from '$lib/ui'
	import { InputNumber, InputSelect, parseOptions, Popover, tip } from 'fuma'
	import { browser } from '$app/environment'
	import type { MemberCondition, MemberConditionOperator } from '$lib/models'
	import { CONDITION_OPERATOR, CONDITION_OPERATOR_LABEL } from './constants'
	import ConditionValue from './ConditionValue.svelte'

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

	function addCondition(value: string) {
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

	$effect(() => {
		if (conditions) getmemberAllowedCount()
	})

	let addConditionOptions = $derived(
		parseOptions({
			...(!conditions.find((c) => c.type === 'valided') && { valided: 'Membre approuvé' }),
			...(!conditions.find((c) => c.type === 'age') && { age: 'Âge minimum' }),
			profile: 'Profil du membre',
		})
	)

	const fieldOptions = $derived(memberFields.map((f) => ({ value: f.id, label: f.name })))

	function operatorOptions(field: Field) {
		return CONDITION_OPERATOR[field.type].map((value) => ({
			value,
			label: CONDITION_OPERATOR_LABEL[value],
		}))
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

		<Popover placement="bottom-end">
			{#snippet trigger(popover)}
				<button type="button" class="btn btn-square" {...popover.trigger}>
					<span class="inline-flex" use:tip={{ content: 'Ajouter une condition' }}>
						<PlusIcon />
					</span>
				</button>
			{/snippet}
			{#snippet children(popover)}
				<ul class="menu w-56">
					{#each addConditionOptions as option (option.value)}
						<li>
							<button
								type="button"
								onclick={() => {
									addCondition(option.value)
									popover.hide()
								}}
							>
								{option.label}
							</button>
						</li>
					{/each}
				</ul>
			{/snippet}
		</Popover>
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
						<InputNumber bind:value={condition.args} label="Âge minimum" min={1} />
					{:else}
						<IdCardIcon class="opacity-70" />

						<div class="flex flex-wrap gap-2">
							<!-- SELECT FIELD -->
							<InputSelect
								items={fieldOptions}
								value={fieldOptions.find((option) => option.value === condition.args.fieldId)}
								placeholder="Sélectioner un champ"
								onSelect={(option) => {
									if (condition.type !== 'profile' || !option) return
									condition.args.fieldId = option.value
									const field = memberFields.find((f) => f.id === option.value)
									if (!field) return
									if (CONDITION_OPERATOR[field.type].includes(condition.args.operator)) return
									condition.args.operator = CONDITION_OPERATOR[field.type][0]
								}}
							/>

							<!-- SELECT OPERATOR -->
							{#if condition.args.fieldId}
								{@const fieldId = condition.args.fieldId}
								{@const field = memberFields.find((f) => f.id === fieldId)}
								{#if field}
									{@const options = operatorOptions(field)}
									<!-- Sans `key`, l'opérateur resterait sur le choix précédent: une `value` passée
									     sans `bind:` cesse de suivre le parent dès que le select y a écrit, et
									     changer de champ le réinitialise justement depuis le parent. -->
									{#key fieldId}
										<InputSelect
											items={options}
											value={options.find((option) => option.value === condition.args.operator)}
											onSelect={(option) => {
												if (condition.type !== 'profile' || !option) return
												condition.args.operator = option.value as MemberConditionOperator
											}}
										/>
									{/key}
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
						<ConditionValue {field} {condition} />
					{/if}
				{/if}
			</div>
		{:else}
			<Placeholder style="height: 80px;">Pas de conditions d'inscription</Placeholder>
		{/each}
	</div>
</div>
