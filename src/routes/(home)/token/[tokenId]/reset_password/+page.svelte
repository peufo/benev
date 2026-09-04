<script lang="ts">
	import { page } from '$app/state'
	import { InputString } from 'fuma'
	import { LockKeyholeOpenIcon } from '@lucide/svelte'

	import { Section } from '$lib/ui'
	import { resetPassword } from './reset_password.remote'

	const redirectTo = page.url.searchParams.get('redirectTo')
</script>

<Section
	id="password-reset"
	title="Réinitialisation de ton mot de passe"
	icon={LockKeyholeOpenIcon}
	class="max-w-md mx-auto"
>
	<form {...resetPassword} class="space-y-3">
		<InputString
			field={resetPassword.fields.password}
			type="password"
			label="Nouveau mot de passe"
			autocomplete="new-password"
		/>

		{#if redirectTo}
			<input type="hidden" name="redirectTo" value={redirectTo} />
		{/if}
		<div class="flex justify-end">
			<button class="btn btn-primary">Réinitialiser</button>
		</div>
	</form>
</Section>
