<script lang="ts">
	import { page } from '$app/stores'

	import { InputPassword } from '$lib/material/input'
	import { useForm } from '$lib/validation'
	import { enhance } from '$app/forms'

	const form = useForm()

	const redirectTo = $page.url.searchParams.get('redirectTo')
</script>

<div class="card bg-base-100 max-w-md m-auto">
	<form method="post" class="card-body" use:enhance={form.submit}>
		<InputPassword key="password" label="Nouveau mot de passe" />
		{#if redirectTo}
			<input type="hidden" name="redirectTo" value={redirectTo} />
		{/if}

		<div class="flex justify-end">
			<button class="btn">Valider</button>
		</div>
	</form>
</div>
