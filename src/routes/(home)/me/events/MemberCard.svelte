<script lang="ts">
	import type { PageData } from './$types'
	import { MemberRole } from '$lib/member'
	import { EVENT_STATES } from '$lib/constant'
	import { CardLink, Icon } from 'fuma'
	import logo from '$lib/assets/logo.svg'

	export let member: PageData['members'][number]

	$: nbSubscribes = member.subscribes.length
	$: nbLeaderOf = member.leaderOf.length
</script>

<CardLink href="/{member.eventId}/me">
	<div class="flex gap-4">
		{#if member.event.posterId}
			<img
				src="/media/{member.event.posterId}?size=a6"
				alt="Affiche de {member.event.name}"
				class="rounded border"
			/>
		{:else}
			<div
				style:width="105px"
				style:height="148px"
				class="bg-base-200/50 grid place-content-center rounded"
			>
				<img src={logo} alt="Affiche par défaut" class="w-16 grayscale opacity-50" />
			</div>
		{/if}

		<div class="grow flex flex-col gap-4">
			<div class="flex gap-2 items-center">
				{#if member.event.icon}
					<img src={member.event.icon} alt="logo de {member.event.name}" class="w-7 inline-block" />
				{/if}
				<span class="font-medium">{member.event.name}</span>

				{#if member.event.state !== 'published'}
					<Icon
						class="opacity-70 z-10 {member.event.state === 'draft' ? 'rotate-12' : ''}"
						size={20}
						path={EVENT_STATES[member.event.state].icon}
						title={EVENT_STATES[member.event.state].label}
					/>
				{/if}
			</div>

			<MemberRole roles={member.roles} class="badge-md" iconSize={20} />

			<div class="flex flex-wrap gap-2">
				<div class="badge whitespace-nowrap">
					{#if nbSubscribes}
						<b class="mr-1 opacity-80">{nbSubscribes}</b>
						<span>Inscription{nbSubscribes > 1 ? 's' : ''}</span>
					{:else}
						<span>Pas d'inscription</span>
					{/if}
				</div>

				{#if nbLeaderOf}
					<div class="badge whitespace-nowrap">
						<b class="mr-1 opacity-80">{nbLeaderOf}</b>
						<span>Secteur{nbLeaderOf > 1 ? 's' : ''} à charge</span>
					</div>
				{/if}
			</div>
		</div>
	</div>
</CardLink>
