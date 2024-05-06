<script lang="ts">
	import { enhance } from '$app/forms'
	import { useForm } from 'fuma/validation'
	import { DialogConfirm } from 'fuma'

	const form = useForm()
</script>

<form method="post" use:enhance={form.submit}>
	<DialogConfirm class="btn-sm">
		<h2 slot="header" class="font-medium text-lg opacity-75">Supprimer mon compte</h2>
		<span class="text-error" slot="activator">Supprimer mon compte</span>

		<p>Es-tu certain de vouloir supprimer ton compte ?</p>
		<p>Attention, cette opération est <b>irréversibles</b> !</p>

		<button slot="action" formaction="/me?/delete_user" class="btn btn-sm">Je confirme</button>
	</DialogConfirm>
</form>
