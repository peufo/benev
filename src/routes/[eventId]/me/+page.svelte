<script lang="ts">
	import { mdiMapMarkerRadiusOutline } from '@mdi/js'
	import { Card, Icon } from 'fuma'
	import { eventPath } from '$lib/store'
	import TeamsSubscribes from '$lib/me/TeamsSubscribes.svelte'
	import { Teams, TeamsActions } from '$lib/team'
	import { MemberProfile, MemberSettingsForm } from '$lib/member'

	export let data
</script>

<Card class="max-w-2xl mx-auto">
	<div class="flex flex-col gap-20">
		<section>
			<div class="flex gap-2 items-center mb-4">
				<h3 class="title">Mes inscriptions</h3>
				{#if data.event.selfSubscribeAllowed}
					<a href="{$eventPath}/teams" class="btn btn-square btn-sm ml-auto">
						<Icon path={mdiMapMarkerRadiusOutline} title="Voir les secteurs" size={20} />
					</a>
				{/if}
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
				<Teams teams={data.member.leaderOf} />
			</section>
		{/if}

		<section>
			{#if data.member.event.memberFields.filter((f) => f.memberCanRead).length}
				<MemberProfile title="Mon profil" member={data.member} />
			{/if}
		</section>

		<section>
			<MemberSettingsForm member={data.member} />
		</section>
	</div>
</Card>
