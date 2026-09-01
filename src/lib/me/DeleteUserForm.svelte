<script lang="ts">
	import { DialogConfirm } from '$lib/ui'
	import { deleteUser } from './user.remote'

	let { ownedEventsCount = 0 }: { ownedEventsCount?: number } = $props()
</script>

<form {...deleteUser}>
	<DialogConfirm class="btn-sm">
		{#snippet header()}
			<h2 class="font-medium text-lg opacity-75">Supprimer mon compte</h2>
		{/snippet}
		{#snippet activator()}
			<span class="text-error">Supprimer mon compte</span>
		{/snippet}

		<p>Es-tu certain·e de vouloir supprimer ton compte ?</p>
		<p>Attention, cette opération est <b>irréversible</b> !</p>

		{#if ownedEventsCount > 0}
			<p class="mt-3 rounded-box border border-error/40 bg-error/10 p-3 text-sm">
				{#if ownedEventsCount === 1}
					L'évènement dont tu es propriétaire sera <b>définitivement supprimé</b>,
				{:else}
					Les <b>{ownedEventsCount} évènements</b> dont tu es propriétaire seront
					<b>définitivement supprimés</b>,
				{/if}
				avec leurs équipes, leurs pages et les données de leurs bénévoles. Pour éviter ça, transfère la
				propriété à quelqu'un d'autre avant de supprimer ton compte.
			</p>
		{/if}

		<ul class="mt-3 list-disc pl-5 text-sm opacity-80">
			<li>Tes sessions, ton mot de passe, tes messages et tes achats sont effacés.</li>
			<li>
				Tes fiches de membre sont anonymisées : tes inscriptions restent au planning des évènements,
				sans ton identité.
			</li>
		</ul>

		{#snippet action()}
			<button formaction={deleteUser.action} class="btn btn-error">Je confirme</button>
		{/snippet}
	</DialogConfirm>
</form>
