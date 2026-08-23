<script lang="ts">
	import {
		IdCardIcon,
		PersonStandingIcon,
		PlusIcon,
		Trash2Icon,
		UserCheckIcon,
	} from '@lucide/svelte'

	import type { Field } from '@prisma/client'
	import { InputNumber, InputSelect, parseOptions, Popover, tip } from 'fuma'
	import { browser } from '$app/environment'
	import { debounce } from '$lib/debounce'
	import type { MemberCondition, MemberConditionOperator } from '$lib/models'
	import { CONDITION_OPERATOR, CONDITION_OPERATOR_LABEL } from './constants'
	import ConditionValue from './ConditionValue.svelte'
	import { countMembersAllowed } from '../member.remote'

	interface Props {
		conditions?: MemberCondition[]
		memberFields: Field[]
		/** Les conditions se soumettent par un input caché, qui n'émet aucun évènement DOM. */
		onchange?: () => void
	}

	let { conditions: initialConditions = [], memberFields, onchange }: Props = $props()

	// Le tableau vient de `page.data`: ce n'est pas un proxy `$state`, écrire dans une condition
	// existante passerait donc inaperçu. On en prend une copie réactive — le formulaire se soumet
	// par l'input caché, le parent n'a rien à relire. Le `Drawer` démonte son contenu à la
	// fermeture: la copie est refaite à chaque ouverture.
	// svelte-ignore state_referenced_locally
	let conditions = $state(structuredClone(initialConditions))
	let memberAllowedCount = $state(0)

	// Sert autant à soumettre qu'à réveiller l'effet: lire `conditions` ne suivrait que les
	// réassignations du tableau, pas les écritures dans une condition.
	const serializedConditions = $derived(JSON.stringify(conditions))

	const refreshMemberAllowedCount = debounce(async (serialized: string) => {
		try {
			memberAllowedCount = await countMembersAllowed(JSON.parse(serialized))
		} catch (err) {
			console.error(err)
		}
	}, 300)

	// Lire la sérialisation abonne l'effet à toute écriture, y compris dans une condition déjà
	// présente: c'est le seul signal qu'un parent puisse recevoir de ce champ caché.
	$effect(() => {
		void serializedConditions
		onchange?.()
	})

	$effect(() => {
		if (!conditions.length || !browser) return
		refreshMemberAllowedCount(serializedConditions)
	})

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
	<input type="hidden" name="conditions" value={serializedConditions} />
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
				<button
					type="button"
					class="btn btn-square btn-secondary btn-soft"
					aria-label="Ajouter une condition"
					{...popover.trigger}
				>
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
			<div class="flex flex-col gap-2 bg-base-200/40 border border-hard rounded-field p-2">
				<div class="flex gap-2 items-start">
					{#if condition.type === 'valided'}
						<UserCheckIcon class="opacity-70" />
						<div class="label">
							<span class="label-text">Membre approuvé</span>
						</div>
					{:else if condition.type === 'age'}
						<PersonStandingIcon class="opacity-70" />
						<InputNumber
							label="Âge minimum"
							min={1}
							bind:value={
								() => condition.args,
								// Vider le champ donne `undefined`: on garde la dernière valeur valide plutôt
								// que d'écrire un `undefined` que le `z.number()` du modèle refuserait — et
								// surtout sans réécrire dans le champ, ce qui empêcherait de le retaper.
								(age) => {
									if (condition.type !== 'age' || age === undefined) return
									condition.args = age
								}
							}
						/>
					{:else}
						<IdCardIcon class="opacity-70" />

						<div class="flex flex-wrap gap-2">
							<!-- SELECT FIELD -->
							<!-- Le getter re-dérive l'item du modèle à chaque fois: contrairement à une
							     `value` passée en simple prop, la liaison continue de suivre le parent. -->
							<InputSelect
								items={fieldOptions}
								placeholder="Sélectioner un champ"
								bind:value={
									() => fieldOptions.find((option) => option.value === condition.args.fieldId),
									(option) => {
										if (condition.type !== 'profile' || !option) return
										if (option.value === condition.args.fieldId) return
										condition.args.fieldId = option.value
										// Changer de champ périme la valeur attendue: un `string[]` laissé sur un
										// champ `string` serait enregistré tel quel et ne matcherait jamais.
										condition.args.expectedValue = ''
										const field = memberFields.find((f) => f.id === option.value)
										if (!field) return
										if (CONDITION_OPERATOR[field.type].includes(condition.args.operator)) return
										condition.args.operator = CONDITION_OPERATOR[field.type][0]
									}
								}
							/>

							<!-- SELECT OPERATOR -->
							{#if condition.args.fieldId}
								{@const fieldId = condition.args.fieldId}
								{@const field = memberFields.find((f) => f.id === fieldId)}
								{#if field}
									{@const options = operatorOptions(field)}
									<InputSelect
										items={options}
										bind:value={
											() => options.find((option) => option.value === condition.args.operator),
											(option) => {
												if (condition.type !== 'profile' || !option) return
												condition.args.operator = option.value as MemberConditionOperator
											}
										}
									/>
								{/if}
							{/if}
						</div>
					{/if}

					<button
						type="button"
						class="btn btn-square btn-sm ml-auto btn-error btn-soft"
						onclick={() =>
							(conditions = [...conditions.slice(0, index), ...conditions.slice(index + 1)])}
					>
						<Trash2Icon size={18} class="opacity-70" />
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
		{/each}
	</div>
</div>
