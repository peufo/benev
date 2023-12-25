<script lang="ts">
	import { mdiMapMarkerRadiusOutline } from '@mdi/js'

	import { eventPath } from '$lib/store'
	import { Icon } from '$lib/material'
	import TeamsSubscribes from '$lib/me/TeamsSubscribes.svelte'

	import { Teams, TeamsActions } from '$lib/team'
	import { MemberProfileStatus, MemberDeleteForm, MemberProfileForm, MemberRole } from '$lib/member'

	export let data
</script>

<div class="flex flex-col gap-20 mt-8">
	<section>
		<div class="flex gap-2 items-center mb-4">
			<h3 class="title">Mes inscriptions</h3>
			<a href="{$eventPath}/teams" class="btn btn-square btn-sm ml-auto">
				<Icon path={mdiMapMarkerRadiusOutline} title="Voir les secteurs" size={20} />
			</a>
		</div>
		<TeamsSubscribes teams={data.memberTeams || []} />
	</section>

	{#if data.member.leaderOf.length}
		<section class="relative">
			<div class="flex gap-2 items-center mb-4">
				<h3 class="title">Secteurs à charge</h3>
				<div class="grow" />
				<TeamsActions teams={data.member.leaderOf} />
			</div>
			<Teams teams={data.member.leaderOf} event={data.event} showAll />
		</section>
	{/if}

	<section>
		{#if data.member.event.memberFields.filter((f) => f.memberCanRead).length}
			<div class="flex gap-2 items-center mb-4">
				<h3 class="title">Ma participation</h3>
				<MemberRole roles={data.member.roles} />
				<MemberProfileStatus member={data.member} />
			</div>
			<MemberProfileForm member={data.member} />
			<hr class="my-3" />
		{/if}

		<div class="mt-3">
			<MemberDeleteForm memberId={data.member.id} class="w-max" />
		</div>
	</section>
</div>
