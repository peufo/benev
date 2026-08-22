<script lang="ts">
	import { Trash2Icon } from '@lucide/svelte'
	import { tip } from 'fuma'
	import type { LogTyped } from './logMap'
	import { snippetRef } from './Snippets.svelte'
	import { deleteNote } from './log.remote'

	let { log, canDelete = false }: { log: LogTyped<'note_create'>; canDelete?: boolean } = $props()

	// Un objet `form` ne s'attache qu'à un seul `<form>`: dans un fil qui porte plusieurs notes,
	// il faut une instance par ligne, sans quoi SvelteKit lève dès la deuxième.
	let deleteThisNote = $derived(deleteNote.for(log.id))
</script>

<div class="flex items-start gap-2">
	<div class="grow min-w-0">
		<p class="text-base-content/70">
			Note de {@render snippetRef(log.data.actor)}
			{#if log.data.member}
				sur {@render snippetRef(log.data.member)}
			{/if}
		</p>
		<p class="whitespace-pre-wrap">{log.data.message}</p>
	</div>

	{#if canDelete}
		<form {...deleteThisNote}>
			<input type="hidden" name="id" value={log.id} />
			<button
				type="submit"
				class="btn btn-ghost btn-square btn-xs"
				aria-label="Supprimer la note"
				use:tip={{ content: 'Supprimer la note' }}
			>
				<Trash2Icon size={16} class="text-error" />
			</button>
		</form>
	{/if}
</div>
