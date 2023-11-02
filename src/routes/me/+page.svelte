<script lang="ts">
	import LayoutBasic from '$lib/LayoutBasic.svelte'
	import MemberRole from '$lib/MemberRole.svelte'
	import { CardLink, Icon } from '$lib/material'
	import ProfileSection from '$lib/me/ProfileSection.svelte'
	import { mdiLogout } from '@mdi/js'

	export let data
</script>

<LayoutBasic user={data.user}>
	<ProfileSection user={data.user} />

	<h2 class="text-xl font-semibold text-base-content/70 mt-4">Mes évenements</h2>

	{#each data.members as member}
		{@const nbSubscribes = member.subscribes.length}
		{@const nbLeaderOf = member.leaderOf.length}

		<CardLink href="/{member.eventId}/me">
			<div slot="title" class="flex gap-2 items-center flex-wrap">
				{#if member.event.logo}
					<img src={member.event.logo} alt="logo de {member.event.name}" class="w-7 inline-block" />
				{/if}
				<span>{member.event.name}</span>
				<MemberRole role={member.role} class="ml-auto" />
			</div>

			<div class="flex gap-2 mt-4">
				<div class="badge">
					{#if nbSubscribes}
						<b class="mr-1 opacity-80">{nbSubscribes}</b>
						<span>Inscription{nbSubscribes > 1 ? 's' : ''}</span>
					{:else}
						<span>Pas d'inscription</span>
					{/if}
				</div>

				{#if nbLeaderOf}
					<div class="badge">
						<b class="mr-1 opacity-80">{nbLeaderOf}</b>
						<span>Secteur{nbLeaderOf > 1 ? 's' : ''} à charge</span>
					</div>
				{/if}
			</div>
		</CardLink>
	{/each}

	<div class="flex">
		<form method="POST" action="/me?/logout" class="contents">
			<button class="btn">
				<Icon path={mdiLogout} size={20} class="opacity-70 rotate-180" />
				Déconnexion
			</button>
		</form>
	</div>
</LayoutBasic>
