<script lang="ts">
	import Header from '$lib/Header.svelte'
	import Footer from '$lib/Footer.svelte'
	import { InputPassword } from '$lib/material/input'
	import { useForm } from '$lib/form'
	import { enhance } from '$app/forms'

	export let data

	const form = useForm()
</script>

<Header userName={data.user?.firstName} />

<main class="grow p-2">
	<div class="card bg-base-100 max-w-md m-auto">
		<form method="post" class="card-body" use:enhance={form.submit}>
			<InputPassword key="password" label="Nouveau mot de passe" />

			<div class="flex justify-end">
				<button class="btn">Valider</button>
			</div>
		</form>
	</div>
</main>

<Footer />
