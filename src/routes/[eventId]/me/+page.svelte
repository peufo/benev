<script lang="ts">
	import { mdiMapMarkerRadiusOutline } from '@mdi/js'

	import { eventPath } from '$lib/store'
	import { Card, Icon } from '$lib/material'
	import TeamsSubscribes from '$lib/me/TeamsSubscribes.svelte'

	import { Teams, TeamsActions } from '$lib/team'
	import { MemberDeleteForm, MemberProfile } from '$lib/member'
	import { EventPubliqueMenuItems } from '$lib/event'
	import { adminTabs } from '../../../lib/layout/adminTabs'
	import { EVENT_STATES } from '$lib/constant'

	export let data
</script>

<Card class="max-w-2xl mx-auto">
	<div class="flex gap-2 items-center">
		{#if data.event.logoId}
			<img
				class="inline-block h-10 mx-1"
				src="/media/{data.event.logoId}?size=medium"
				alt="logo of {data.event.name}"
			/>
		{:else if data.event.icon}
			<img class="inline-block w-5 mx-1" src={data.event.icon} alt="icon of {data.event.name}" />
		{/if}

		<h1 class="title text-2xl">
			{data.event.name}
		</h1>

		{#if data.event.state !== 'published'}
			<Icon
				class="opacity-70 ml-1 {data.event.state === 'draft' ? 'rotate-12' : ''}"
				size={20}
				path={EVENT_STATES[data.event.state].icon}
				title={EVENT_STATES[data.event.state].label}
			/>
		{/if}
	</div>

	<section class="mt-4">
		<h3 class="font-semibold opacity-50 pt-1 text-sm">Pages publiques</h3>
		<div class="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
			<EventPubliqueMenuItems
				pages={data.pages}
				classItem="bg-base-200/30 border bordered overflow-hidden"
			/>
		</div>
	</section>

	{#if data.member.roles.includes('leader')}
		<section class="mt-4">
			<h3 class="font-semibold opacity-50 pt-1 text-sm">Pages de gestion</h3>
			<div class="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
				{#each $adminTabs as { href, isActive, label, icon }}
					<a
						{href}
						class="menu-item bg-base-200/20 border bordered overflow-hidden"
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
</Card>
