<script lang="ts">
	import type { Subscribe, User } from '@prisma/client'
	import { eventPath } from '$lib/store'
	import { SubscribeCreatedBy, SubscribeMenu, SubscribeStateForm } from '$lib/subscribe'
	import { mdiAlertOutline } from '@mdi/js'
	import { Icon, tip } from 'fuma'

	export let subscribes: (Subscribe & { member?: { user: User } })[]
</script>

<div class="flex flex-col gap-1">
	{#each subscribes as subscribe}
		<div class="flex items-center gap-3 px-3 py-[5px] rounded-md border bg-base-100">
			{#if subscribe.isAbsent}
				<div use:tip={{ content: 'Ce membre a été absent à sa periode de travail' }}>
					<Icon path={mdiAlertOutline} class="fill-warning" size={20} />
				</div>
			{/if}

			{#if subscribe.member}
				<a
					class="whitespace-nowrap grow link link-hover"
					title="Voir les infos de {subscribe.member.user.firstName}"
					href="{$eventPath}/admin/members/{subscribe.memberId}"
				>
					{subscribe.member.user.firstName}
					{subscribe.member.user.lastName}
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
