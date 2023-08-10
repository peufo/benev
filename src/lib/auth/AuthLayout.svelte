<script lang="ts">
	import Footer from '$lib/Footer.svelte'
	import Header from '$lib/Header.svelte'
	import Login from '$lib/auth/Login.svelte'
	import AuthMenu from '$lib/auth/AuthMenu.svelte';

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
		<div class="flex gap-4 items-start flex-wrap justify-center">
			<div class="hidden lg:block">
				<AuthMenu/>
			</div>

			<div class="card bg-base-100 max-w-3xl" style="width: -webkit-fill-available;">
				<div class="card-body">
					<slot />
				</div>
			</div>
		</div>
	{/if}
</main>

<Footer />
