<script lang="ts">
	import Teams from '$lib/Teams.svelte'
	import { Card, Icon } from '$lib/material'
	import MemberSubscribes from '$lib/me/MemberSubscribes.svelte'
	import MemberProfileForm from '$lib/member/MemberProfileForm.svelte'
	import { eventPath } from '$lib/store'
	import { mdiAccountMultipleOutline, mdiArrowLeft, mdiClipboardTextMultipleOutline } from '@mdi/js'
	import Profile from './Profile.svelte'
	import { page } from '$app/stores'
	import DisplayToggle from '$lib/material/display/DisplayToggle.svelte'

	export let data

	$: teamsId = JSON.stringify(data.memberProfile.leaderOf.map((team) => team.id))
</script>

<div class="grid gap-6">
	<div class="flex gap-2 items-center">
		<a href="{$eventPath}/admin/members{$page.url.search}" class="btn btn-square btn-ghost btn-sm">
			<Icon path={mdiArrowLeft} size={20} />
		</a>

		<div class="card-title grow">
			{data.memberProfile.user.firstName}
			{data.memberProfile.user.lastName}
		</div>
		<slot name="action" />
	</div>

	<Profile user={data.memberProfile.user}>
		<div class="divider" />
		<MemberProfileForm
			event={data.event}
			fieldsValue={data.memberProfile.profile}
			memberId={data.memberProfile.id}
		/>
	</Profile>

	<MemberSubscribes events={[data.event]} isLeader>
		<span slot="title">Inscriptions</span>
	</MemberSubscribes>

	<Card class="border">
		<h2 slot="title">Secteurs à charge</h2>

		<div slot="action" class="flex gap-2">
			{#if data.memberProfile.leaderOf.length}
				<DisplayToggle />
				<a href="{$eventPath}/admin/members?teams={teamsId}" class="btn btn-square btn-sm">
					<Icon path={mdiAccountMultipleOutline} title="Tous les membres de ces secteurs" />
				</a>
				<a href="{$eventPath}/admin/subscribes?teams={teamsId}" class="btn btn-square btn-sm">
					<Icon
						path={mdiClipboardTextMultipleOutline}
						title="Toutes les inscriptions de ces secteurs"
					/>
				</a>
			{/if}
		</div>
		<Teams teams={data.memberProfile.leaderOf} showAll />
	</Card>
</div>
