<script lang="ts">
	import Footer from '$lib/Footer.svelte'
	import Header from '$lib/Header.svelte'
	import Login from '$lib/Login.svelte'
	import { page } from '$app/stores'
	import type { User } from 'lucia'

	export let user: User | undefined
	const tabs = [
		{ path: 'subscribes', label: 'Mes inscriptions' },
		{ path: 'profile', label: 'Profil' },
		{ path: 'account', label: 'Compte' },
	]
</script>

<div class="p-2">
	<Header userName={user?.name} />
</div>

<main class="grow p-2">
	{#if !user}
		<Login />
	{:else}
		<div class="flex gap-4 items-start flex-wrap justify-center">
			<ul class="menu menu-lg bg-base-100 rounded-box text-clip">
				{#each tabs as { path, label }}
					{@const href = `/auth/${path}`}
					<li>
						<a {href} class:active={$page.url.pathname === href}>
							{label}
						</a>
					</li>
				{/each}
			</ul>

			<div class="card bg-base-100 max-w-3xl" style="width: -webkit-fill-available;">
				<div class="card-body">
					<slot />
				</div>
			</div>
		</div>
	{/if}
</main>

<Footer />
