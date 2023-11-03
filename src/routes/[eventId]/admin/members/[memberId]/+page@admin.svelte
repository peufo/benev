<script lang="ts">
	import { Card, Icon, SectionCollapse } from '$lib/material'

	import MemberProfileForm from '$lib/member/MemberProfileForm.svelte'
	import { eventPath } from '$lib/store'
	import { mdiArrowLeft } from '@mdi/js'
	import Profile from './Profile.svelte'
	import { page } from '$app/stores'
	import Avatar from '$lib/me/Avatar.svelte'
	import LeaderOf from '$lib/LeaderOf.svelte'
	import TeamsSubscribes from '$lib/me/TeamsSubscribes.svelte'
	import MemberRole from '$lib/MemberRole.svelte'

	export let data
</script>

<div class="grid gap-6">
	<div class="flex justify-between">
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

				<MemberRole roles={data.memberProfile.roles} />
			</div>
			<Profile user={data.memberProfile.user} class="sm:pt-4" />
		</div>

		<Avatar user={data.memberProfile.user} class="h-36 w-36 rounded-md" large />
	</div>

	<SectionCollapse value="profile">
		<h2 slot="title">Informations complémentaires</h2>
		<MemberProfileForm member={data.memberProfile} />
	</SectionCollapse>

	<Card class="border">
		<h2 slot="title">Inscriptions</h2>
		<TeamsSubscribes teams={data.event.teams} isLeader />
	</Card>

	<LeaderOf teams={data.memberProfile.leaderOf} />
</div>
