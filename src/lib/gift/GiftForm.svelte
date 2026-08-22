<script lang="ts">
	import type { Gift, GiftCondition } from '@prisma/client'
	import { GIFT_CONDITION_MODE } from '$lib/constant'
	import { InputRadio, InputString } from 'fuma'
	import GiftConditions from './GiftConditions.svelte'
	import { enhanceForm } from '$lib/enhanceForm'
	import { createGift } from './gift.remote'

	type GiftWithConditions = Gift & { conditions: GiftCondition[] }
	interface Props {
		gift?: GiftWithConditions | undefined
	}

	let { gift = $bindable(undefined) }: Props = $props()

	// L'édition d'une prestation existante n'a jamais eu d'action côté serveur (fonction
	// en chantier): seule la création est branchée.

	const uid = $props.id()

	// Une instance par prestation: le dialogue reste monté d'une prestation à l'autre, et l'état
	// d'un formulaire distant vit dans son module. Voir AGENTS.md, « L'état d'un formulaire vit
	// dans son module ».
	const remoteForm = $derived(gift?.id ? createGift.for(gift.id) : createGift.for(uid))
</script>

<form
	{...remoteForm.enhance(enhanceForm({ onsuccess: () => (gift = remoteForm.result) }))}
	class="flex flex-col gap-2"
>
	<InputString
		field={remoteForm.fields.name}
		label="Nom de la prestation"
		value={gift?.name}
		placeholder="T-Shirt, Boisson, Repas, ..."
	/>
	{#if gift?.conditions.length}
		<InputRadio
			field={remoteForm.fields.conditionsMode}
			label="Méthode de calcul"
			options={GIFT_CONDITION_MODE}
		/>
	{/if}

	<GiftConditions conditions={gift?.conditions} />

	<div class="flex flex-row-reverse">
		<button class="btn">Valider</button>
	</div>
</form>
