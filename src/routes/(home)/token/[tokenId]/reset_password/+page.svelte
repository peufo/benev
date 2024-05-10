<script lang="ts">
	import { page } from '$app/stores'
	import { enhance } from '$app/forms'
	import { InputPassword } from 'fuma'
	import { useForm } from 'fuma/validation'

	import { Oauth } from '$lib/me'

	const form = useForm()

	const redirectTo = $page.url.searchParams.get('redirectTo')
	const newUser = $page.url.searchParams.get('newUser')
	const eventName = $page.url.searchParams.get('eventName')
</script>

<div class="card bg-base-100 max-w-md m-auto shadow-lg">
	<form method="post" class="card-body" use:enhance={form.submit}>
		{#if newUser}
			<h2 class="title mb-4">Salut {newUser}👋</h2>
			{#if eventName}
				<p>
					Merci d'avoir accepté de rejoindre l'équipe bénévole
					<b>{eventName}</b> ❤️
				</p>
				<br />
			{/if}

			<p>Pour accéder à ton compte, tu peux utiliser un des ces services :</p>
			<Oauth />
			<div class="divider" />
			<p>Ou alors, tu peux définir ton mot de passe</p>
		{:else}
			<h2 class="title mb-4">Réinitialisation de ton mot de passe</h2>
		{/if}

		<InputPassword key="password" label="Nouveau mot de passe" autocomplete="new-password" />

		{#if redirectTo}
			<input type="hidden" name="redirectTo" value={redirectTo} />
		{/if}
		<div class="flex justify-end">
			<button class="btn">Valider</button>
		</div>
	</form>
</div>
