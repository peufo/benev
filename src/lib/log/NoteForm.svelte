<script lang="ts">
	import { SendHorizontalIcon } from '@lucide/svelte'
	import { InputTextarea } from 'fuma'
	import { enhanceForm } from '$lib/enhanceForm'
	import { createNote } from './log.remote'

	interface Props {
		/** Absent: la note se pose sur le fil de l'évènement. */
		memberId?: string
		placeholder?: string
	}

	let { memberId, placeholder = 'Ajouter une note au journal' }: Props = $props()

	// Une instance par sujet: le brouillon commencé sur le fil de l'évènement n'a rien à faire
	// dans celui d'un membre, et le formulaire est monté aux deux endroits.
	const remoteForm = $derived(createNote.for(memberId ?? 'event'))
	let message = $derived(remoteForm.fields.message.value() ?? '')
</script>

<form
	{...remoteForm.enhance(enhanceForm({ reset: true, invalid: false }))}
	class="relative flex flex-col"
>
	{#if memberId}<input type="hidden" name="memberId" value={memberId} />{/if}

	<!-- Le champ part sur une ligne et grandit avec la note: `min-h-10` défait le plancher de
	     5rem de `.textarea`, que la hauteur posée par l'autoresize ne peut pas franchir, et laisse
	     juste la place du bouton. `pr-11` dégage la colonne où celui-ci s'encastre. -->
	<InputTextarea
		variant="bare"
		label={placeholder}
		field={remoteForm.fields.message}
		rows={1}
		maxHeight={160}
		class="min-h-10 pr-11 resize-none"
	/>

	<!-- Ancré en haut: le bas du formulaire descend avec les messages de validation. -->
	<button
		type="submit"
		class="btn btn-primary btn-square btn-sm absolute right-1 top-1"
		aria-label="Publier la note"
		disabled={!message.trim()}
	>
		<SendHorizontalIcon size={18} />
	</button>
</form>
