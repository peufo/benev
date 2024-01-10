<script lang="ts">
	import { mdiMapMarkerRadiusOutline } from '@mdi/js'

	import { eventPath } from '$lib/store'
	import { Icon } from '$lib/material'
	import TeamsSubscribes from '$lib/me/TeamsSubscribes.svelte'

	import { Teams, TeamsActions } from '$lib/team'
	import { MemberDeleteForm, MemberProfile } from '$lib/member'
	import { adminTabs } from '../admin/adminTabs'

	export let data
</script>

{#if data.member.roles.includes('leader')}
	<section>
		<div class="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
			{#each $adminTabs as { href, isActive, label, icon }}
				<a
					{href}
					class="menu-item bg-base-200/30 border bordered overflow-hidden"
					class:active={isActive}
				>
					<Icon path={icon} size={20} class="opacity-70" />

					{label}
				</a>
			{/each}
		</div>
	</section>
{/if}
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
				<TeamsActions teams={data.member.leaderOf} memberId={data.member.id} />
			</div>
			<Teams teams={data.member.leaderOf} event={data.event} showAll />
		</section>
	{/if}

	<section>
		{#if data.member.event.memberFields.filter((f) => f.memberCanRead).length}
			<MemberProfile title="Mon profil" member={data.member} />
			<hr class="my-3" />
		{/if}

		<div class="mt-3 flex justify-end">
			<MemberDeleteForm memberId={data.member.id} class="w-max" />
		</div>
	</section>
</div>
