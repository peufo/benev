<script lang="ts">
	import { mdiPlus } from '@mdi/js'
	import type { GiftConditionType, GiftCondition as TGiftEdition } from '@prisma/client'
	import GiftCondition from './GiftCondition.svelte'
	import { GIFT_CONDITION_TYPE } from '$lib/constant'
	import { Icon, InputSelect } from 'fuma'

	export let conditions: Partial<TGiftEdition>[] = []

	let conditionType = ''
	function addCondition() {
		conditions = [...conditions, { type: conditionType as GiftConditionType }]
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
		options={GIFT_CONDITION_TYPE}
		on:select={addCondition}
		bind:value={conditionType}
		class="btn-square"
		placeholder="Ajouter un condition"
	/>
</div>

{#each conditions as condition}
	<GiftCondition {condition} />
{/each}
