<script lang="ts">
	import MemberForm from '$lib/MemberForm.svelte'

	import Profile from '$lib/me/ProfileForm.svelte'
	import MemberProfile from '$lib/member/MemberProfile.svelte'
	import TeamsSubscribes from '$lib/me/TeamsSubscribes.svelte'
	import { Card, Icon } from '$lib/material'
	import { mdiArrowLeft, mdiLogout } from '@mdi/js'
	import LeaderOf from '$lib/LeaderOf.svelte'

	export let data
</script>

<div class="max-w-3xl mx-auto flex flex-col gap-4">
	{#if data.member?.isValidedByUser}
		<Profile user={data.user} />

		{#if data.member.event.memberFields.length}
			<MemberProfile fieldsValue={data.member.profile} event={data.member.event} />
		{/if}

		<Card class="border">
			<h2 slot="title">Mes inscriptions</h2>
			<TeamsSubscribes teams={data.teamsSubscribes} />
		</Card>

		{#if data.member.leaderOf.length}
			<LeaderOf teams={data.member.leaderOf} />
		{/if}
	{:else}
		<MemberForm event={data.event} userId={data.user.id} class="mx-auto" noCancelButton />
	{/if}

	<div class="flex gap-2 justify-between">
		<a href="/me" class="btn">
			<Icon path={mdiArrowLeft} size={20} />
			Tous mes événements
		</a>
		<form method="POST" action="/me?/logout" class="contents">
			<button class="btn">
				<Icon path={mdiLogout} size={20} class="opacity-70" />
				Déconnexion
			</button>
		</form>
	</div>
</div>
