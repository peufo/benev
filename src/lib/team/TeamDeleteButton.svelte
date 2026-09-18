<script lang="ts">
	import { enhanceForm } from '$lib/enhanceForm'
	import { deleteTeam } from './team.remote'
	import { confirmDialog } from 'fuma'
	import { Trash2Icon } from '@lucide/svelte'

	interface Props {
		team: { id: string; nbSubscribes?: number; periods?: unknown[] }
		redirectTo?: string
	}

	let { team, redirectTo }: Props = $props()

	const remoteForm = $derived(deleteTeam.for(team.id))

	// Un secteur vide part sans question; dès qu'un créneau est planifié, le travail perdu se relit.
	function confirmDelete() {
		const nbPeriods = team.periods?.length ?? 0
		const nbSubscribes = team.nbSubscribes ?? 0
		if (nbPeriods === 0 && nbSubscribes === 0) return true
		const contents = [
			nbPeriods && `${nbPeriods} créneau${nbPeriods > 1 ? 'x' : ''}`,
			nbSubscribes && `${nbSubscribes} inscription${nbSubscribes > 1 ? 's' : ''}`,
		].filter(Boolean)
		return confirmDialog({
			title: 'Supprimer ce secteur ?',
			message: `Il contient déjà ${contents.join(' et ')}. Cette opération est irréversible.`,
			confirmLabel: 'Supprimer',
			danger: true,
		})
	}
</script>

<form
	{...remoteForm.enhance(enhanceForm({ before: confirmDelete, success: 'Secteur supprimé' }))}
	class="contents"
>
	<input type="hidden" name="id" value={team.id} />
	{#if redirectTo}
		<input type="hidden" name="redirectTo" value={redirectTo} />
	{/if}
	<button type="submit" class="btn btn-sm btn-error btn-ghost">
		<Trash2Icon size={18} />
		<span>Supprimer</span>
	</button>
</form>
