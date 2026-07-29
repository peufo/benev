<script lang="ts">
	import { DialogConfirm } from '$lib/fuma-legacy'
	import { deleteUser } from './user.remote'
</script>

<form {...deleteUser}>
	<DialogConfirm class="btn-sm">
		{#snippet header()}
			<h2 class="font-medium text-lg opacity-75">Supprimer mon compte</h2>
		{/snippet}
		{#snippet activator()}
			<span class="text-error">Supprimer mon compte</span>
		{/snippet}

		<p>Es-tu certain de vouloir supprimer ton compte ?</p>
		<p>Attention, cette opération est <b>irréversibles</b> !</p>

		{#snippet action()}
			<button formaction={deleteUser.action} class="btn btn-error">Je confirme</button>
		{/snippet}
	</DialogConfirm>
</form>
