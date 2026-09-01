<script lang="ts">
	import {
		CircleQuestionMarkIcon,
		FunnelIcon,
		IdCardIcon,
		PersonStandingIcon,
		PlusIcon,
		Trash2Icon,
		UserCheckIcon,
		UsersIcon,
	} from '@lucide/svelte'

	import type { ClassValue } from 'svelte/elements'
	import type { Field } from '@prisma/client'
	import { InputNumber, InputSelect, Popover } from 'fuma'
	import { browser } from '$app/env'
	import { debounce } from '$lib/debounce'
	import type { MemberCondition, MemberConditionOperator } from '$lib/models'
	import Section from '$lib/ui/Section.svelte'
	import { CONDITION_OPERATOR, CONDITION_OPERATOR_LABEL } from './constants'
	import ConditionValue from './ConditionValue.svelte'
	import { countMembersAllowed } from '../member.remote'

	interface Props {
		conditions?: MemberCondition[]
		memberFields: Field[]
		/** Les conditions se soumettent par un input caché, qui n'émet aucun évènement DOM. */
		onchange?: () => void
		/** La section remplit la page: c'est elle qui dit jusqu'où celle-ci monte. */
		class?: ClassValue
	}

	let { conditions: initialConditions = [], memberFields, onchange, class: klass }: Props = $props()

	// Le tableau vient de `page.data`: ce n'est pas un proxy `$state`, écrire dans une condition
	// existante passerait donc inaperçu. On en prend une copie réactive — le formulaire se soumet
	// par l'input caché, le parent n'a rien à relire.
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

	function addCondition(type: MemberCondition['type']) {
		if (type === 'valided') conditions = [...conditions, { type: 'valided' }]
		if (type === 'age') conditions = [...conditions, { type: 'age', args: 18 }]
		if (type === 'profile')
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

	// Le libellé ouvre le bouton, l'aide le suit: le nom accessible reste préfixé du libellé.
	const ADD_CONDITION = {
		valided: { label: 'Membre approuvé' },
		age: { label: 'Âge minimum' },
		profile: { label: 'Profil du membre' },
	} satisfies Record<MemberCondition['type'], { label: string }>

	// Approbation et âge ne se posent qu'une fois; un profil se compare autant de fois qu'il a
	// de champs.
	const addConditionOptions = $derived(
		Object.entries(ADD_CONDITION).filter(
			([type]) => type === 'profile' || !conditions.find((c) => c.type === type)
		) as [MemberCondition['type'], (typeof ADD_CONDITION)['valided']][]
	)

	const fieldOptions = $derived(memberFields.map((f) => ({ value: f.id, label: f.name })))

	function operatorOptions(field: Field) {
		return CONDITION_OPERATOR[field.type].map((value) => ({
			value,
			label: CONDITION_OPERATOR_LABEL[value],
		}))
	}
</script>

<!-- La section porte sa propre surface: elle se monte à même la page, jamais dans un tiroir ni
     dans une carte. -->
<Section
	id="conditions"
	title="Conditions d'accès"
	icon={FunnelIcon}
	subtitle="Qui voit ce secteur et peut s'y inscrire"
	class={klass}
>
	{#snippet action()}
		<Popover listenHover class="w-max max-w-sm my-1 surface">
			{#snippet trigger(popover)}
				<button
					type="button"
					class="btn btn-square btn-ghost"
					aria-label="Aide"
					{...popover.trigger}
				>
					<CircleQuestionMarkIcon size={20} opacity={0.7} />
				</button>
			{/snippet}
			<div class="flex flex-col gap-2 text-sm text-base-content/70">
				<p>Sans condition, le secteur est ouvert à tous les membres.</p>
				<p>
					Dès qu'une condition est posée, un membre doit
					<b class="font-semibold">toutes</b> les remplir. Sinon, le secteur n'apparaît pas dans sa liste
					et il ne peut pas s'y inscrire.
				</p>
				<p>
					Les responsables du secteur y accèdent toujours et peuvent y inscrire n'importe quel
					membre à la main. Une personne déjà inscrite garde son accès.
				</p>
			</div>
		</Popover>

		<Popover listenHover placement="bottom-end" class="my-1">
			{#snippet trigger(popover)}
				<button
					type="button"
					class="btn btn-square btn-secondary btn-soft"
					aria-label="Ajouter une condition"
					{...popover.trigger}
				>
					<PlusIcon />
				</button>
			{/snippet}
			{#snippet children(popover)}
				<ul class="menu w-64">
					{#each addConditionOptions as [type, option] (type)}
						<li>
							<button
								type="button"
								class="flex-col items-start gap-0"
								onclick={() => {
									addCondition(type)
									popover.hide()
								}}
							>
								<span>{option.label}</span>
							</button>
						</li>
					{/each}
				</ul>
			{/snippet}
		</Popover>
	{/snippet}

	<input type="hidden" name="conditions" value={serializedConditions} />

	<div class="mt-4 flex flex-col gap-2">
		{#each conditions as condition, index (index)}
			<div class="flex flex-col gap-2 bg-base-200/40 border border-hard rounded-field p-2">
				<div class="flex gap-2 items-start">
					{#if condition.type === 'valided'}
						<UserCheckIcon class="opacity-70 shrink-0" />
						<div class="label flex-col items-start">
							<span class="label-text">Membre approuvé</span>
							<span class="text-xs text-base-content/60">
								Le membre a été validé par l'organisation.
							</span>
						</div>
					{:else if condition.type === 'age'}
						<PersonStandingIcon class="opacity-70 shrink-0" />
						<div class="flex flex-col gap-1">
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
							<span class="text-xs text-base-content/60">
								Calculé d'après la date de naissance renseignée par le membre.
							</span>
						</div>
					{:else}
						<IdCardIcon class="opacity-70 shrink-0" />

						<div class="flex flex-col gap-1">
							<div class="flex flex-wrap gap-2">
								<!-- SELECT FIELD -->
								<!-- Le getter re-dérive l'item du modèle à chaque fois: contrairement à une
								     `value` passée en simple prop, la liaison continue de suivre le parent. -->
								<InputSelect
									items={fieldOptions}
									placeholder="Sélectionner un champ"
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

							<!-- L'aide s'efface une fois le champ choisi: la comparaison se lit alors seule. -->
							{#if !condition.args.fieldId}
								<span class="text-xs text-base-content/60">
									Choisir un champ du profil, puis la valeur attendue.
								</span>
							{/if}
						</div>
					{/if}

					<button
						type="button"
						class="btn btn-square btn-sm ml-auto btn-error btn-soft"
						aria-label="Retirer la condition"
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

	<div class="mt-4 flex items-center gap-2 border-t border-soft pt-3 text-sm">
		<UsersIcon size={18} class="opacity-70 shrink-0" />
		<span>
			Visible pour
			{#if !conditions.length}
				tous les membres
			{:else}
				{memberAllowedCount} membre{memberAllowedCount > 1 ? 's' : ''}
			{/if}
		</span>
	</div>
</Section>
