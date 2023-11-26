<script lang="ts">
	import type { Gift, GiftCondition } from '@prisma/client'
	import { eventPath } from '$lib/store'
	import { conditionsModeLabel, useForm } from '$lib/validation'
	import { enhance } from '$app/forms'
	import { InputRadio, InputText } from '$lib/material'
	import GiftConditions from './GiftConditions.svelte'

	type GiftWithConditions = Gift & { conditions: GiftCondition[] }
	export let gift: GiftWithConditions | undefined = undefined

	const createAction = '?/create_gift'
	const updateAction = '?/update_gift'

	const form = useForm<GiftWithConditions>({
		successCallback: (url, data) => {
			if (url.search === createAction) gift = data
		},
		successReset: (url) => url.search !== createAction,
	})
</script>

<form
	action="{$eventPath}/admin/config{!!gift ? updateAction : createAction}"
	method="post"
	use:enhance={form.submit}
	class="flex flex-col gap-2"
>
	{#if gift}
		<input type="hidden" name="id" value={gift.id} />
	{/if}
	<InputText
		key="name"
		value={gift?.name}
		label="Nom de la prestation"
		input={{ placeholder: 'T-Shirt, Boisson, Repas, ...' }}
	/>
	{#if gift?.conditions.length}
		<InputRadio
			key="conditionsMode"
			label="Méthode de calcul"
			optionsClass="flex gap-4"
			options={conditionsModeLabel}
			value={gift?.conditionsMode}
		/>
	{/if}

	<GiftConditions conditions={gift?.conditions} />

	<div class="flex flex-row-reverse">
		<button class="btn">Valider</button>
	</div>
</form>
