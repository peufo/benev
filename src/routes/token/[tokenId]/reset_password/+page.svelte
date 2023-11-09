<script lang="ts">
	import { page } from '$app/stores'
	import Header from '$lib/Header.svelte'
	import Footer from '$lib/Footer.svelte'
	import { InputPassword } from '$lib/material/input'
	import { useForm } from '$lib/form'
	import { enhance } from '$app/forms'

	export let data

	const form = useForm()

	const redirectTo = $page.url.searchParams.get('redirectTo')
</script>

<Header user={data.user} />

<main class="grow p-2">
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
</main>

<Footer />
