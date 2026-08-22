<script lang="ts">
	import { SendHorizontalIcon } from '@lucide/svelte'
	import { createNote } from './log.remote'

	let { memberId, placeholder = 'Ajouter une note au journal' }: Props = $props()

	interface Props {
		/** Absent: la note se pose sur le fil de l'évènement. */
		memberId?: string
		placeholder?: string
	}

	let value = $state('')
</script>

<form
	{...createNote.enhance(async ({ submit }) => {
		const ok = await submit()
		if (ok) value = ''
	})}
	class="flex items-end gap-2"
>
	{#if memberId}<input type="hidden" name="memberId" value={memberId} />{/if}

	<textarea
		name="message"
		bind:value
		rows="1"
		{placeholder}
		class="textarea w-full grow field-sizing-content"></textarea>

	<button
		type="submit"
		class="btn btn-primary btn-square"
		aria-label="Publier la note"
		disabled={!value.trim()}
	>
		<SendHorizontalIcon size={20} />
	</button>
</form>

{#each createNote.fields.message.issues() as issue (issue.message)}
	<p class="text-error text-sm mt-1">{issue.message}</p>
{/each}
