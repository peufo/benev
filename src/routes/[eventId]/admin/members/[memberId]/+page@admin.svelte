<script lang="ts">
	import {
		ArrowLeftIcon,
		CheckIcon,
		ClipboardListIcon,
		PencilIcon,
		Trash2Icon,
		XIcon,
	} from '@lucide/svelte'
	import { Card } from '$lib/ui'
	import { DropDown, tip } from 'fuma'
	import { Drawer } from 'fuma'
	import { urlParam } from 'fuma'
	import { eventPath } from '$lib/store'
	import { page } from '$app/stores'
	import Avatar from '$lib/me/Avatar.svelte'
	import { Teams, TeamsActions } from '$lib/team'
	import TeamsSubscribes from '$lib/me/TeamsSubscribes.svelte'
	import MemberContactDetails from './MemberContactDetails.svelte'
	import MemberIsAdminForm from './MemberIsAdminForm.svelte'
	import MemberIsValidedByEventForm from './MemberIsValidedByEventForm.svelte'
	import {
		MemberProfileStatus,
		MemberAbsences,
		MemberRole,
		MemberProfile,
		MemberDeleteForm,
		MemberCreateSubscribeDialog,
		MemberContactForm,
	} from '$lib/member'
	import MembersBadges from '../MembersBadges.svelte'

	let { data } = $props()

	let createSubscribeDialog: HTMLDialogElement = $state()!
</script>

<Card class="max-w-3xl mx-auto w-full" bodyClass="gap-12">
	<div>
		<div class="flex gap-2 items-center flex-wrap">
			<a
				href="{$eventPath}/admin/members{$page.url.search}"
				class="btn btn-square btn-ghost btn-sm"
			>
				<ArrowLeftIcon size={20} />
			</a>

			<span class="title">
				{data.memberProfile.firstName}
				{data.memberProfile.lastName}
			</span>

			<a
				href={urlParam.with({ form_member_contact: '{}' })}
				data-sveltekit-replacestate
				data-sveltekit-noscroll
				class="btn btn-square btn-sm ml-2"
			>
				<span
					class="inline-flex"
					use:tip={{ content: `Modifier le coordonnées de ${data.memberProfile.firstName}` }}
					><PencilIcon /></span
				>
			</a>

			<MembersBadges
				title="Imprimer un badge"
				params="memberId={data.memberProfile.id}"
				badges={data.event.badges}
			/>

			<div class="grow"></div>

			<MemberAbsences subscribes={data.memberProfile.subscribes} />
			<MemberProfileStatus member={data.memberProfile} />

			{#if data.member?.roles.includes('admin') && !data.memberProfile.roles.includes('owner')}
				<DropDown hideOnBlur tippyProps={{ arrow: true }}>
					{#snippet activator()}
						<button class="btn btn-sm ml-2 whitespace-nowrap">
							<MemberRole roles={data.memberProfile.roles} mode="contents" />
							{#if data.memberProfile.isValidedByEvent}
								<span
									class="inline-flex"
									use:tip={{ content: "Membre approuvé par l'organisation" }}
									><CheckIcon class="text-success" /></span
								>
							{:else}
								<span
									class="inline-flex"
									use:tip={{ content: "Membre non approuvé par l'organisation" }}
									><XIcon class="text-error" /></span
								>
							{/if}
						</button>
					{/snippet}

					<MemberIsValidedByEventForm memberProfile={data.memberProfile} />

					{#if data.member?.roles.includes('owner')}
						<MemberIsAdminForm memberProfile={data.memberProfile} />
					{/if}

					<MemberDeleteForm
						memberId={data.memberProfile.id}
						redirectTo="{$eventPath}/admin/members"
						btn={false}
						class="menu-item w-full"
					>
						<Trash2Icon size={20} class="text-error" />
						<span>Supprimer le membre</span>
					</MemberDeleteForm>
				</DropDown>
			{:else}
				<MemberRole roles={data.memberProfile.roles} />
			{/if}
		</div>

		<div class="flex gap-2 mt-6">
			<MemberContactDetails member={data.memberProfile} />
			<Avatar
				firstName={data.memberProfile.firstName}
				avatarId={data.memberProfile.avatarId}
				avatarPlaceholder={data.memberProfile.avatarPlaceholder}
				class="w-36 h-36 rounded-md"
				size="medium"
			/>
		</div>
	</div>

	{#if data.event.memberFields.length}
		<section>
			<MemberProfile hideStatus member={data.memberProfile} />
		</section>
	{/if}

	<section>
		<div class="flex gap-2 items-center mb-4">
			<h3 class="title">Inscriptions</h3>
			<button
				type="button"
				class="btn btn-square btn-sm ml-2"
				onclick={() => createSubscribeDialog.showModal()}
			>
				<span
					class="inline-flex"
					use:tip={{ content: `Inscrire ${data.memberProfile.firstName} à un secteur` }}
					><ClipboardListIcon size={20} /></span
				>
			</button>
		</div>
		<TeamsSubscribes teams={data.event.teams} isLeader />
	</section>

	<section class="relative">
		<div class="flex gap-2 items-center mb-4">
			<h3 class="title mr-2">Secteurs à charge</h3>
			<TeamsActions teams={data.memberProfile.leaderOf} memberId={data.memberProfile.id} />
		</div>
		<Teams teams={data.memberProfile.leaderOf} />
	</section>
</Card>

<MemberCreateSubscribeDialog
	bind:dialog={createSubscribeDialog}
	memberId={data.memberProfile.id}
	title="Nouvelle inscription pour {data.memberProfile.firstName}"
/>

<Drawer
	title="Modifier le coordonnées de {data.memberProfile.firstName}"
	key="form_member_contact"
	class="surface-drawer"
	classBody="pt-4"
>
	{#snippet children({ close })}
		<MemberContactForm member={data.memberProfile} onsuccess={() => close()} />
	{/snippet}
</Drawer>
