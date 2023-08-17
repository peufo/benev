<script lang="ts">
	import Teams from '$lib/Teams.svelte'
	import { Card } from '$lib/material'
	import UserSubscribes from '$lib/me/UserSubscribes.svelte'
	import { eventPath } from '$lib/store'
	import Profile from './Profile.svelte'

	export let data
</script>

<div class="grid gap-6">
	<Profile user={data.memberProfile.user} />

	<UserSubscribes events={[data.event]} title="" isEditor>
		<span slot="title">Inscriptions</span>
	</UserSubscribes>

	<Card>
		<h2 slot="title">
			Secteurs à charge
			{#if data.memberProfile.leaderOf.length}
				<a
					href="{$eventPath}/admin?teams={JSON.stringify(
						data.memberProfile.leaderOf.map((team) => team.id)
					)}"
					class="btn btn-xs ml-2"
				>
					Voir les bénévoles
				</a>
			{/if}
		</h2>
		<Teams teams={data.memberProfile.leaderOf} isOwner={data.isOwner} />
	</Card>
</div>
