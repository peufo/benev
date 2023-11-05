<script lang="ts">
	import MemberForm from '$lib/MemberForm.svelte'

	import ProfileSection from '$lib/me/ProfileSection.svelte'
	import ProfileForm from '$lib/me/ProfileForm.svelte'
	import MemberProfileForm from '$lib/member/MemberProfileForm.svelte'
	import TeamsSubscribes from '$lib/me/TeamsSubscribes.svelte'
	import { Card, Icon } from '$lib/material'
	import { mdiArrowLeft, mdiSlashForward } from '@mdi/js'
	import LeaderOf from '$lib/LeaderOf.svelte'
	import MemberRole from '$lib/MemberRole.svelte'
	import { goto, invalidateAll } from '$app/navigation'
	import { urlParam } from '$lib/store'

	export let data
</script>

<div class="max-w-3xl mx-auto flex flex-col gap-4">
	{#if data.member?.isValidedByUser}
		<ProfileSection user={data.user}>
			<div slot="title" class="flex flex-wrap">
				<a href="/me" class="link link-hover">
					{data.user.firstName}
					{data.user.lastName}
				</a>
				<span class="flex">
					<Icon path={mdiSlashForward} size={18} />
					<span class="whitespace-nowrap text-ellipsis">
						{data.event.name}
					</span>
				</span>
			</div>

			<span slot="subtitle">
				<MemberRole roles={data.member.roles} />
			</span>

			<h3 class="font-medium text-base-content/70 mt-4">
				Informations commune à tous les événements
			</h3>
			<ProfileForm user={data.user} />

			{#if data.member.event.memberFields.length}
				<hr class="my-6" />
				<h3 class="font-medium text-base-content/70 mt-4">
					Informations spécifiques à {data.event.name}
				</h3>
				<MemberProfileForm member={data.member} />
			{/if}
		</ProfileSection>

		<Card class="border">
			<h2 slot="title">Mes inscriptions</h2>
			<TeamsSubscribes teams={data.memberTeams || []} />
		</Card>

		{#if data.member.leaderOf.length}
			<LeaderOf teams={data.member.leaderOf} />
		{/if}
	{:else}
		<MemberForm
			event={data.event}
			userId={data.user.id}
			class="mx-auto"
			noCancelButton
			successReset={false}
			on:success={() => invalidateAll().then(() => goto($urlParam.with({ section: 'profile' })))}
		/>
	{/if}

	<div class="flex gap-2 justify-between flex-wrap">
		<a href="/me" class="btn btn-sm">
			<Icon path={mdiArrowLeft} size={20} />
			Tous mes événements
		</a>
	</div>
</div>
