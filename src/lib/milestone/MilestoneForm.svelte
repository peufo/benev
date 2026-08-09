<script lang="ts">
	import type { Milestone } from '@prisma/client'
	import { ButtonDelete, InputDateTime, InputString } from 'fuma'
	import { enhanceForm } from '$lib/enhanceForm'
	import { getEventTimeZone } from '$lib/timezone'
	import { createMilestone, deleteMilestone, updateMilestone } from './milestone.remote'

	interface Props {
		milestone?: Partial<Milestone>
		oncreated?: () => void
		onupdated?: () => void
		ondeleted?: () => void
	}

	let { milestone = {}, oncreated, onupdated, ondeleted }: Props = $props()

	const remoteForm = $derived(milestone.id ? updateMilestone : createMilestone)
	const deleteFormId = $props.id()
</script>

{#if milestone.id}
	<!-- HTML interdit les <form> imbriqués: ce formulaire ne porte que les champs cachés, son
	bouton vit dans la barre d'actions du formulaire principal, associé par l'attribut `form`. -->
	<form
		{...deleteMilestone.enhance(
			enhanceForm({ success: 'Jalon supprimé', onsuccess: () => ondeleted?.() })
		)}
		id={deleteFormId}
		class="hidden"
	>
		<input type="hidden" name="id" value={milestone.id} />
	</form>
{/if}

<form
	{...remoteForm.enhance(
		enhanceForm({
			success: 'Succès',
			onsuccess: () => (milestone.id ? onupdated?.() : oncreated?.()),
		})
	)}
	class="flex flex-col gap-4"
>
	{#if milestone.id}
		<input type="hidden" name="id" value={milestone.id} />
	{/if}

	<InputString
		field={remoteForm.fields.name}
		label="Nom"
		value={milestone.name}
		autocomplete="off"
	/>
	<InputDateTime
		field={remoteForm.fields.timestamp}
		label="Date"
		layout="datetime"
		value={milestone.timestamp ?? new Date()}
		timezone={getEventTimeZone()}
	/>

	<div class="flex flex-row-reverse gap-2 border-t pt-4">
		<button class="btn btn-primary">Valider</button>
		{#if milestone.id}
			<div class="grow"></div>
			<ButtonDelete form={deleteFormId} formaction={deleteMilestone.action} />
		{/if}
	</div>
</form>
