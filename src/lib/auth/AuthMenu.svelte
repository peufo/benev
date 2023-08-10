<script lang="ts">
	import { page } from '$app/stores'

	const tabs = [
		{ path: 'subscribes', label: 'Mes inscriptions' },
		{ path: 'profile', label: 'Mon profil' },
	]
</script>

<ul class="menu menu-lg bg-base-100 rounded-box text-clip">
	{#each tabs as { path, label }}
		{@const href = `/auth/${path}`}
		<li>
			<a {href} class:active={$page.url.pathname === href}>
				{label}
			</a>
		</li>
	{/each}

	<div class="divider">
		<form method="POST" action="/auth?/logout">
			<button class="btn btn-sm"> Déconnexion </button>
		</form>
	</div>
</ul>
