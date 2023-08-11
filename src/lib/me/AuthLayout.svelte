<script lang="ts">
	import Footer from '$lib/Footer.svelte'
	import Header from '$lib/Header.svelte'
	import Login from '$lib/me/Login.svelte'
	import AuthMenu from '$lib/me/AuthMenu.svelte'

	import type { User } from 'lucia'

	export let user: User | undefined
</script>

<div class="p-2">
	<Header userName={user?.name} />
</div>

<main class="grow p-2">
	{#if !user}
		<Login />
	{:else}
		<div class="card bg-base-100 max-w-3xl m-auto">
			<div class="card-body">
				<slot />
			</div>
		</div>
	{/if}
</main>

<Footer />
