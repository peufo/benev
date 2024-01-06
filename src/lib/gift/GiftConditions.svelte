<script lang="ts">
	import { mdiPlus } from '@mdi/js'
	import type { GiftConditionType, GiftCondition as TGiftEdition } from '@prisma/client'
	import GiftCondition from './GiftCondition.svelte'
	import { conditionTypeOptions } from '$lib/validation'
	import { Icon, InputSelect } from '$lib/material'

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
		options={conditionTypeOptions}
		on:select={addCondition}
		bind:value={conditionType}
		class="btn-square"
	>
		<svelte:fragment slot="placeholder">
			<Icon path={mdiPlus} title="Ajouter une condition" tippyProps={{ appendTo: 'parent' }} />
		</svelte:fragment>
	</InputSelect>
</div>

{#each conditions as condition}
	<GiftCondition {condition} />
{/each}
