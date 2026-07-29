<script lang="ts">
	import type { Gift, GiftCondition } from '@prisma/client'
	import { GIFT_CONDITION_MODE } from '$lib/constant'
	import { InputRadio, InputString } from 'fuma'
	import GiftConditions from './GiftConditions.svelte'
	import { createGift } from './gift.remote'

	type GiftWithConditions = Gift & { conditions: GiftCondition[] }
	interface Props {
		gift?: GiftWithConditions | undefined
	}

	let { gift = $bindable(undefined) }: Props = $props()

	// L'édition d'une prestation existante n'a jamais eu d'action côté serveur (fonction
	// en chantier): seule la création est branchée.
</script>

<form
	{...createGift.enhance(async ({ submit }) => {
		await submit()
		gift = createGift.result
	})}
	class="flex flex-col gap-2"
>
	<InputString
		field={createGift.fields.name}
		label="Nom de la prestation"
		defaultValue={gift?.name}
		placeholder="T-Shirt, Boisson, Repas, ..."
	/>
	{#if gift?.conditions.length}
		<InputRadio
			field={createGift.fields.conditionsMode}
			label="Méthode de calcul"
			options={GIFT_CONDITION_MODE}
		/>
	{/if}

	<GiftConditions conditions={gift?.conditions} />

	<div class="flex flex-row-reverse">
		<button class="btn">Valider</button>
	</div>
</form>
