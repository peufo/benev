<script lang="ts">
	import type { Gift, GiftCondition } from '@prisma/client'
	import { eventPath } from '$lib/store'
	import { conditionsModeLabel, useForm } from '$lib/validation'
	import { enhance } from '$app/forms'
	import { InputRadio, InputText } from '$lib/material'
	import GiftConditionForm from './GiftConditionForm.svelte'

	export let gift: (Gift & { conditions: GiftCondition[] }) | undefined = undefined

	const form = useForm()
</script>

<form
	action="{$eventPath}/admin/config?{!!gift ? '/update_gift' : '/create_gift'}"
	method="post"
	use:enhance={form.submit}
>
	{#if gift}
		<input type="hidden" name="id" value={gift.id} />
	{/if}
	<InputText key="name" value={gift?.name} label="Nom de la prestation" />
	{#if gift?.conditions.length}
		<InputRadio
			key="conditionsMode"
			label="Méthode de calcul"
			optionsClass="flex gap-4"
			options={conditionsModeLabel}
			value={gift?.conditionsMode}
		/>
	{/if}
</form>

{#if !!gift}
	{#each gift.conditions as condition}
		<GiftConditionForm {condition} />
	{/each}
{/if}
