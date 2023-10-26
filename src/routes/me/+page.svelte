<script lang="ts">
	import LayoutBasic from '$lib/LayoutBasic.svelte'
	import { CardLink, Icon } from '$lib/material'
	import Profile from '$lib/me/ProfileForm.svelte'
	import { mdiLogout } from '@mdi/js'

	export let data
</script>

<LayoutBasic user={data.user}>
	<Profile user={data.user} />

	<h2 class="text-xl font-semibold text-base-content/70 mt-4">Mes évenements</h2>

	{#each data.events as event}
		<CardLink href="/{event.id}/me">
			<h2 slot="title">
				{#if event.logo}
					<img src={event.logo} alt="logo de {event.name}" class="w-8 pr-2 inline-block" />
				{/if}
				<span>{event.name}</span>
			</h2>
		</CardLink>
	{/each}

	<div class="flex justify-end">
		<form method="POST" action="/me?/logout" class="contents">
			<button class="btn">
				<Icon path={mdiLogout} size={20} class="opacity-70" />
				Déconnexion
			</button>
		</form>
	</div>
</LayoutBasic>
