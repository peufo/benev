<script lang="ts">
	import { toast } from 'svelte-sonner'
	import { enhanceForm } from '$lib/enhanceForm'
	import { deleteTeam } from './team.remote'

	interface Props {
		team: { id: string; nbSubscribes?: number }
		/** Où atterrir après la suppression. Redirigé par le serveur, pas par le client. */
		redirectTo?: string
	}

	let { team, redirectTo }: Props = $props()

	const remoteForm = $derived(deleteTeam.for(team.id))

	function confirmDelete() {
		const nb = team.nbSubscribes || 0
		if (nb === 0) return true
		const msg = [
			`Ce secteur contient déjà ${nb} inscription${nb > 1 ? 's' : ''} !`,
			'Es-tu certain de vouloir le supprimer ?',
		].join('\n')
		if (confirm(msg)) return true
		toast.info('Suppression du secteur annulée !')
		return false
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
	<button type="submit" class="btn btn-error">Supprimer le secteur</button>
</form>
