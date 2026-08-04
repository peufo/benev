<script lang="ts">
	import { daytz } from '$lib/dayjs'
	import type { Milestone } from '@prisma/client'
	import { ButtonDelete, InputString } from 'fuma'
	import { enhanceForm } from '$lib/enhanceForm'
	import InputTzDateTime from './InputTzDateTime.svelte'
	import { createMilestone, deleteMilestone, updateMilestone } from './milestone.remote'

	interface Props {
		milestone?: Partial<Milestone>
		oncreated?: () => void
		onupdated?: () => void
		ondeleted?: () => void
	}

	let { milestone = {}, oncreated, onupdated, ondeleted }: Props = $props()

	const remoteForm = $derived(milestone.id ? updateMilestone : createMilestone)
</script>

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
	<InputTzDateTime key="timestamp" label="Date" value={daytz(milestone.timestamp)} />

	<div class="flex flex-row-reverse gap-2 border-t pt-4">
		<button class="btn btn-primary">Valider</button>
	</div>
</form>

{#if milestone.id}
	<form
		{...deleteMilestone.enhance(
			enhanceForm({ success: 'Jalon supprimé', onsuccess: () => ondeleted?.() })
		)}
		class="flex"
	>
		<input type="hidden" name="id" value={milestone.id} />
		<ButtonDelete formaction={deleteMilestone.action}>Supprimer</ButtonDelete>
	</form>
{/if}
