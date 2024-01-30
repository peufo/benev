<script lang="ts">
	import { eventPath } from '$lib/store'
	import { DeleteButton } from '$lib/material'
	import { useForm } from '$lib/validation'
	import { enhance } from '$app/forms'

	export let memberId: string
	export let redirectTo = '/me'
	let klass = ''
	export { klass as class }
	export let btn = true

	const form = useForm({
		successMessage: 'Membre supprimé',
	})
</script>

<form method="post" class="contents" use:enhance={form.submit}>
	<input type="hidden" name="memberId" value={memberId} />
	<input type="hidden" name="redirectTo" value={redirectTo} />
	<DeleteButton formaction="{$eventPath}/api/members?/delete_member" class={klass} {btn}>
		<slot>Supprimer ma participation à l'évènement</slot>
	</DeleteButton>
</form>
