<script lang="ts">
	import { mdiArrowLeft, mdiMapMarkerRadiusOutline, mdiSlashForward } from '@mdi/js'

	import { eventPath } from '$lib/store'
	import { Card, Icon, Placeholder } from '$lib/material'
	import ProfileSection from '$lib/me/ProfileSection.svelte'
	import ProfileForm from '$lib/me/ProfileForm.svelte'
	import TeamsSubscribes from '$lib/me/TeamsSubscribes.svelte'
	import MemberForm from '$lib/MemberForm.svelte'
	import MemberProfileForm from '$lib/member/MemberProfileForm.svelte'
	import MemberRole from '$lib/MemberRole.svelte'
	import MemberDeleteForm from '$lib/member/MemberDeleteForm.svelte'
	import LeaderOf from '$lib/LeaderOf.svelte'
	import { eventStates } from '$lib/validation/index.js'

	export let data
</script>

<div class="max-w-3xl mx-auto flex flex-col gap-4">
	<div class="flex gap-2 justify-between flex-wrap">
		<a href="/me" class="btn btn-sm btn-ghost">
			<Icon path={mdiArrowLeft} size={20} />
			Tous mes évènements
		</a>
	</div>

	{#if data.member?.isValidedByUser}
		<ProfileSection user={data.user}>
			<svelte:fragment slot="title">
				<div class="flex">
					<a href="/me" class="link link-hover">
						{data.user.firstName}
						{data.user.lastName}
					</a>
					<Icon path={mdiSlashForward} size={18} />
				</div>

				<div class="flex">
					<span class="overflow-hidden whitespace-nowrap text-ellipsis min-w-0">
						{data.event.name}
					</span>
					{#if data.event.state !== 'active'}
						<Icon
							class="opacity-70 ml-1 {data.event.state === 'draft' ? 'rotate-12' : ''}"
							size={20}
							path={eventStates[data.event.state].icon}
							title={eventStates[data.event.state].label}
						/>
					{/if}
				</div>
			</svelte:fragment>

			<span slot="subtitle">
				<MemberRole roles={data.member.roles} />
			</span>

			<h3 class="font-medium text-base-content/70 mt-4">Profil général</h3>
			<ProfileForm user={data.user} />

			{#if data.member.event.memberFields.length}
				<hr class="my-6" />
				<h3 class="font-medium text-base-content/70 mt-4">
					Informations spécifiques à {data.event.name}
				</h3>
				<MemberProfileForm member={data.member} />
			{/if}

			<hr class="my-6" />
			<MemberDeleteForm memberId={data.member.id} class="w-max btn-sm" />
		</ProfileSection>

		<Card class="border">
			<div slot="title" class="flex gap-2">
				<h3>Mes inscriptions</h3>
				<a href="{$eventPath}/teams" class="btn btn-square btn-sm ml-auto">
					<Icon path={mdiMapMarkerRadiusOutline} title="Voir les secteurs" size={20} />
				</a>
			</div>
			<TeamsSubscribes teams={data.memberTeams || []} />
		</Card>

		{#if data.member.leaderOf.length}
			<LeaderOf teams={data.member.leaderOf} />
		{/if}
	{:else if data.event.selfRegisterAllowed}
		<MemberForm event={data.event} userId={data.user.id} class="mx-auto" noCancelButton />
	{:else}
		<Placeholder class="border text-center bg-base-100/90">
			<h2 class="text-lg">Invitation requise</h2>
			<p>Tu dois être invité par un responsable pour pouvoir devenir membre de cette évènement.</p>
		</Placeholder>
	{/if}
</div>
