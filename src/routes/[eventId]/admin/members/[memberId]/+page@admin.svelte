<script lang="ts">
	import { ClipboardListIcon, PencilIcon, PlusIcon, ScrollTextIcon } from '@lucide/svelte'
	import { Drawer, tip, urlParam } from 'fuma'
	import { eventPath } from '$lib/eventPath'
	import Avatar from '$lib/me/Avatar.svelte'
	import { TeamsActions } from '$lib/team'
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
	import { Journal } from '$lib/log'
	import { Placeholder } from '$lib/ui'
	import Section from '$lib/ui/Section.svelte'
	import MemberMenu from './MemberMenu.svelte'
	import MemberResendInviteForm from './MemberResendInviteForm.svelte'

	let { data } = $props()

	// Créer un champ de profil passe par `permission.admin`: un responsable consulte la fiche
	// mais ne définit pas ce qu'on demande aux membres.
	const isAdmin = $derived(!!data.member?.roles.includes('admin') || !!data.userIsRoot)

	let createSubscribeDialog: HTMLDialogElement = $state()!
</script>

<div class="max-w-3xl mx-auto w-full space-y-3">
	<Section id="member" title="{data.memberProfile.firstName} {data.memberProfile.lastName}" back>
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
			<TeamsActions teams={data.memberProfile.leaderOf} />
			<!-- La réponse au badge « Sans compte » rendu juste en dessous: tant que personne n'a
			     lié de compte, l'invitation peut être rejouée — après correction de l'adresse. -->
			{#if data.memberProfile.email && !data.memberProfile.userId}
				<MemberResendInviteForm email={data.memberProfile.email} />
			{/if}
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
			<div class="flex flex-col items-center gap-1 w-36 shrink-0">
				<Avatar
					firstName={data.memberProfile.firstName}
					avatarId={data.memberProfile.avatarId}
					avatarPlaceholder={data.memberProfile.avatarPlaceholder}
					class="w-36 h-36 rounded-md"
					size="medium"
				/>
				{#if data.memberProfile.userProfileRequiredFields.includes('avatarId')}
					<span class="text-xs text-warning">Photo de profil requise</span>
				{/if}
			</div>
			<div>
				<MemberAbsences subscribes={data.memberProfile.subscribes} />
				<MemberProfileStatus member={data.memberProfile} />
				<MemberContactDetails member={data.memberProfile} />
			</div>
		</div>
		{#if isAdmin || data.memberProfile.event.memberFields.length}
			<div class="divider"></div>

			<div class="flex items-center gap-2">
				<h3 class="title-md grow">Champs du profil</h3>
				{#if isAdmin}
					<!-- Le tiroir vit dans le layout de l'évènement: il s'ouvre par l'URL, sur
					     place, et l'enregistrement recharge la fiche avec le nouveau champ. -->
					<a
						href={urlParam.with({ form_field: '{}' })}
						data-sveltekit-replacestate
						data-sveltekit-noscroll
						class="btn btn-square btn-sm btn-secondary"
						aria-label="Ajouter un champ au profil"
						use:tip={{ content: 'Ajouter un champ au profil' }}
					>
						<PlusIcon size={20} />
					</a>
				{/if}
			</div>

			{#if data.memberProfile.event.memberFields.length}
				<MemberProfileForm compact saveBar memberProfile={data.memberProfile} />
			{:else}
				<Placeholder class="h-20">Aucun champ de profil</Placeholder>
			{/if}
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

	{#if data.journal}
		<Journal journal={data.journal} timezone={data.event.timezone} class="max-h-[80vh]">
			{#snippet action()}
				<a
					href={eventPath(`/admin/dashboard?memberId=${data.memberProfile.id}#journal`)}
					class="btn btn-sm btn-square"
					use:tip={{ content: 'Ouvrir le journal complet' }}
				>
					<ScrollTextIcon size={20} />
				</a>
			{/snippet}
		</Journal>
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
