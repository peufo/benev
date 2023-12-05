<script lang="ts">
	import { Card, DropDown, Icon, SectionCollapse } from '$lib/material'

	import { eventPath } from '$lib/store'
	import { mdiArrowLeft, mdiTrashCanOutline } from '@mdi/js'
	import { page } from '$app/stores'
	import Avatar from '$lib/me/Avatar.svelte'
	import LeaderOf from '$lib/LeaderOf.svelte'
	import TeamsSubscribes from '$lib/me/TeamsSubscribes.svelte'
	import Profile from './Profile.svelte'
	import SetAdminForm from './SetAdminForm.svelte'
	import { MemberProfileStatus, MemberAbsences, MemberRole, MemberProfileForm, MemberDeleteForm } from '$lib/member'

	export let data
</script>

<div class="grid gap-6">
	<div class="flex justify-between gap-8">
		<div>
			<div class="flex gap-2 items-center flex-wrap">
				<a
					href="{$eventPath}/admin/members{$page.url.search}"
					class="btn btn-square btn-ghost btn-sm"
				>
					<Icon path={mdiArrowLeft} size={20} />
				</a>

				<span class="card-title">
					{data.memberProfile.user.firstName}
					{data.memberProfile.user.lastName}
				</span>

				{#if data.member?.roles.includes('admin') && !data.memberProfile.roles.includes('owner')}
					<DropDown hideOnBlur tippyProps={{ arrow: true }}>
						<button slot="activator" class="btn btn-sm ml-2">
							<MemberRole roles={data.memberProfile.roles} mode="contents" />
						</button>

						{#if data.member?.roles.includes('owner')}
							<SetAdminForm memberProfile={data.memberProfile} />
						{/if}

						<MemberDeleteForm
							memberId={data.memberProfile.id}
							redirectTo="{$eventPath}/admin/members"
							btn={false}
							class="menu-item w-full"
						>
							<Icon path={mdiTrashCanOutline} size={20} class="fill-error" />
							<span>Supprimer le membre</span>
						</MemberDeleteForm>
					</DropDown>
				{:else}
					<MemberRole roles={data.memberProfile.roles} />
				{/if}

				<MemberAbsences subscribes={data.memberProfile.subscribes} />
				<MemberProfileStatus member={data.memberProfile}/>

			</div>
			<Profile user={data.memberProfile.user} class="sm:pt-4" />
		</div>

		<Avatar
			user={data.memberProfile.user}
			class="w-24 h-24 sm:w-36 sm:h-36 rounded-md"
			size="medium"
		/>
	</div>

	{#if data.event.memberFields.length}
		<SectionCollapse value="profile">
			<h2 slot="title">Informations complémentaires</h2>
			<MemberProfileForm member={data.memberProfile} />
		</SectionCollapse>
	{/if}

	<Card class="border">
		<h2 slot="title">Inscriptions</h2>
		<TeamsSubscribes teams={data.event.teams} isLeader />
	</Card>

	<LeaderOf teams={data.memberProfile.leaderOf} event={data.event} />
</div>
