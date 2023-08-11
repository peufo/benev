<script lang="ts">
	import { page } from '$app/stores'
	import { Icon } from '$lib/material'
	import { mdiAccountOutline } from '@mdi/js'

	const tabs = [
		{ path: 'subscribes', label: 'Mes inscriptions' },
		{ path: 'profile', label: 'Mon profil' },
	]

	export let userName = ''
</script>

{#if userName}
	<div class="dropdown dropdown-bottom dropdown-end">
		<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<label tabindex="0" class="btn">
			<Icon path={mdiAccountOutline} />
			<span class="hidden lg:block">{userName || ''}</span>
		</label>

		<ul class="dropdown-content menu menu-lg shadow-lg bg-base-100 rounded-box w-56">
			{#each tabs as { path, label }}
				{@const href = `/me/${path}`}
				<li>
					<a {href} class:active={$page.url.pathname === href}>
						{label}
					</a>
				</li>
			{/each}

			<div class="divider">
				<form method="POST" action="/me?/logout">
					<button class="btn btn-sm"> Déconnexion </button>
				</form>
			</div>
		</ul>
	</div>
{:else}
	<a class="btn-ghost rounded-btn btn btn-square" href="/me">
		<Icon path={mdiAccountOutline} />
	</a>
{/if}
