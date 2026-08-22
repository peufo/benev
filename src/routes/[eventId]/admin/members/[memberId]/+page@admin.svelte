<script lang="ts">
	import { ClipboardListIcon, PencilIcon, ScrollTextIcon } from '@lucide/svelte'
	import { Drawer, tip, urlParam } from 'fuma'
	import { eventPath } from '$lib/store'
	import Avatar from '$lib/me/Avatar.svelte'
	import { Teams, TeamsActions } from '$lib/team'
	import TeamsSubscribes from '$lib/me/TeamsSubscribes.svelte'
	import MemberContactDetails from './MemberContactDetails.svelte'
	import {
		MemberProfileStatus,
		MemberAbsences,
		MemberRole,
		MemberProfileForm,
		MemberCreateSubscribeDialog,
		MemberContactForm,
	} from '$lib/member'
	import MembersBadges from '../MembersBadges.svelte'
	import { Logs, loadPreviousEventLogs } from '$lib/log'
	import Section from '$lib/ui/Section.svelte'
	import MemberMenu from './MemberMenu.svelte'

	let { data } = $props()

	let createSubscribeDialog: HTMLDialogElement = $state()!
	let isAdmin = $derived(!!data.member?.roles.includes('admin'))
</script>

<div class="max-w-3xl mx-auto my-3 w-full space-y-4">
	<!-- TODO inclure le bouton de retour quelque part + utilisé history.back plutôt, car on vient pas toujours de la table des membres -->
	<!-- <a
			href="{$eventPath}/admin/members{$page.url.search}"
			class="btn btn-square btn-ghost btn-sm"
		>
			<ArrowLeftIcon size={20} />
		</a> -->

	<Section id="member" title="{data.memberProfile.firstName} {data.memberProfile.lastName}">
		{#snippet action()}
			{#if data.member?.roles.includes('admin') && !data.memberProfile.roles.includes('owner')}
				<MemberMenu {data} />
			{:else}
				<MemberRole roles={data.memberProfile.roles} />
			{/if}
			<MembersBadges
				title="Imprimer un badge"
				params="memberId={data.memberProfile.id}"
				badges={data.event.badges}
			/>
			<a
				href={urlParam.with({ form_member_contact: '{}' })}
				data-sveltekit-replacestate
				data-sveltekit-noscroll
				class="btn btn-square btn-sm btn-secondary"
				use:tip={{ content: `Modifier les coordonnées de ${data.memberProfile.firstName}` }}
			>
				<PencilIcon />
			</a>
		{/snippet}

		<div class="flex gap-2 mt-6">
			<Avatar
				firstName={data.memberProfile.firstName}
				avatarId={data.memberProfile.avatarId}
				avatarPlaceholder={data.memberProfile.avatarPlaceholder}
				class="w-36 h-36 rounded-md"
				size="medium"
			/>
			<div>
				<MemberAbsences subscribes={data.memberProfile.subscribes} />
				<MemberProfileStatus member={data.memberProfile} />
				<MemberContactDetails member={data.memberProfile} />
			</div>
		</div>
		{#if data.event.memberFields.length}
			<div class="divider"></div>
			<MemberProfileForm compact saveBar memberProfile={data.memberProfile} />
		{/if}
	</Section>

	<Section id="subscibes" title="Inscriptions">
		{#snippet action()}
			<button
				type="button"
				class="btn btn-square btn-sm btn-secondary"
				onclick={() => createSubscribeDialog.showModal()}
				use:tip={{ content: `Inscrire ${data.memberProfile.firstName} à un secteur` }}
			>
				<ClipboardListIcon size={20} />
			</button>
		{/snippet}

		<TeamsSubscribes teams={data.event.teams} isLeader />
	</Section>

	<Section id="leaderOf" title="Secteurs à charge">
		{#snippet action()}
			<TeamsActions teams={data.memberProfile.leaderOf} memberId={data.memberProfile.id} />
		{/snippet}
		<Teams teams={data.memberProfile.leaderOf}>
			{#snippet placeholder()}
				<span>Aucun secteur à charge</span>
			{/snippet}
		</Teams>
	</Section>

	{#if isAdmin}
		<Section id="logs" title="Journal">
			{#snippet action()}
				<a
					href="{$eventPath}/admin/logs?memberId={data.memberProfile.id}"
					class="btn btn-sm btn-square"
					use:tip={{ content: 'Ouvrir le journal complet' }}
				>
					<ScrollTextIcon size={20} />
				</a>
			{/snippet}
			<Logs
				logs={data.journal.logs}
				hasMore={data.journal.hasMore}
				title="{data.memberProfile.firstName} {data.memberProfile.lastName}"
				timezone={data.event.timezone}
				showNoteForm
				noteMemberId={data.memberProfile.id}
				loadPrevious={(beforeId) =>
					loadPreviousEventLogs({ beforeId, memberId: data.memberProfile.id })}
				canDeleteNote={(log) =>
					log.type === 'note_create' && (isAdmin || log.createdById === data.member?.userId)}
			/>
		</Section>
	{/if}
</div>

<MemberCreateSubscribeDialog
	bind:dialog={createSubscribeDialog}
	memberId={data.memberProfile.id}
	title="Nouvelle inscription pour {data.memberProfile.firstName}"
/>

<Drawer
	title="Modifier les coordonnées de {data.memberProfile.firstName}"
	key="form_member_contact"
	class="surface-drawer"
	classBody="pt-4"
>
	{#snippet children({ close })}
		<MemberContactForm member={data.memberProfile} onsuccess={() => close()} />
	{/snippet}
</Drawer>
