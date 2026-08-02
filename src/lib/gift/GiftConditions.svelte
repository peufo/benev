<script lang="ts">
	import type { GiftConditionType, GiftCondition as TGiftEdition } from '@prisma/client'
	import GiftCondition from './GiftCondition.svelte'
	import { GIFT_CONDITION_TYPE } from '$lib/constant'
	import { InputSelect, parseOptions } from 'fuma'

	interface Props {
		conditions?: Partial<TGiftEdition>[]
	}

	let { conditions = $bindable([]) }: Props = $props()

	const conditionTypes = parseOptions(GIFT_CONDITION_TYPE)

	// La valeur choisie est consommée aussitôt: on la remet à vide pour que le champ
	// réaffiche son invite.
	let conditionType = $state('')
	function addCondition(type: string) {
		conditions = [...conditions, { type: type as GiftConditionType }]
		conditionType = ''
	}
</script>

<div class="flex items-center mt-4">
	<div class="grow">
		<h3 class="text-lg font-medium opacity-75">
			{conditions.length === 0
				? 'Pas de condition'
				: conditions.length === 1
					? 'Une condition'
					: `${conditions.length} conditions`}
		</h3>
		{#if conditions.length === 0}
			<span class="text-sm opacity-75">Touts les membres ont droit à un exemplaire</span>
		{/if}
	</div>

	<InputSelect
		items={conditionTypes}
		getValue={(option) => option.value}
		onSelect={(option) => addCondition(option.value)}
		bind:value={conditionType}
		placeholder="Ajouter une condition"
	/>
</div>

{#each conditions as condition, i (i)}
	<GiftCondition {condition} />
{/each}
