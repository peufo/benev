<script lang="ts">
	import type { Subscribe, User } from '@prisma/client'
	import { eventPath } from '$lib/store'
	import { SubscribeCreatedBy, SubscribeMenu, SubscribeStateForm } from '$lib/subscribe'
	import { mdiAlertOutline } from '@mdi/js'
	import { Icon, tip } from 'fuma'
	import { Avatar } from '$lib/me'

	export let subscribes: (Subscribe & { member: { user?: User; isValidedByUser: boolean } })[]
</script>

<div class="flex flex-col gap-1">
	{#each subscribes as subscribe (subscribe.id)}
		<div class="flex items-center gap-2 px-3 py-2 pr-2 rounded-md border bg-base-100">
			{#if subscribe.isAbsent}
				<div use:tip={{ content: 'Ce membre a été absent à sa periode de travail' }}>
					<Icon path={mdiAlertOutline} class="fill-warning" size={20} />
				</div>
			{/if}

			{#if subscribe.member.user}
				<a
					class="whitespace-nowrap grow flex gap-2 items-center pr-2 h-8 rounded hover:bg-base-200 bg-base-200/40 border"
					title="Voir les infos de {subscribe.member.user.firstName}"
					href="{$eventPath}/admin/members/{subscribe.memberId}"
				>
					<Avatar user={subscribe.member.user} class="h-8 w-8 rounded border" />
					<span class="text-sm">
						{subscribe.member.user.firstName}
						{subscribe.member.user.lastName}
					</span>
				</a>
			{/if}

			<SubscribeCreatedBy createdBy={subscribe.createdBy} size={20} class="mr-auto w-8" />

			<SubscribeStateForm {subscribe} isLeader on:success />

			<SubscribeMenu {subscribe} />
		</div>
	{:else}
		<div class="w-full text-center opacity-60 text-sm px-2 py-4">
			<span>Pas d'inscription pour l'instant</span>
		</div>
	{/each}
</div>
