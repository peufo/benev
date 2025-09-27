<script lang="ts">
	import { DropDown, Icon, Card, urlParam, Drawer } from 'fuma'

	import { eventPath } from '$lib/store'
	import {
		mdiArrowLeft,
		mdiCheck,
		mdiClipboardTextOutline,
		mdiClose,
		mdiPencilOutline,
		mdiTrashCanOutline,
	} from '@mdi/js'
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

	export let data

	let createSubscribeDialog: HTMLDialogElement
</script>

<Card class="max-w-3xl mx-auto w-full" bodyClass="gap-12">
	<div>
		<div class="flex gap-2 items-center flex-wrap">
			<a
				href="{$eventPath}/admin/members{$page.url.search}"
				class="btn btn-square btn-ghost btn-sm"
			>
				<Icon path={mdiArrowLeft} size={20} />
			</a>

			<span class="title">
				{data.memberProfile.firstName}
				{data.memberProfile.lastName}
			</span>

			<a
				href={$urlParam.with({ form_member_contact: '{}' })}
				data-sveltekit-replacestate
				data-sveltekit-noscroll
				class="btn btn-square btn-sm ml-2"
			>
				<Icon
					path={mdiPencilOutline}
					title="Modifier le coordonnées de {data.memberProfile.firstName}"
				/>
			</a>

			<div class="grow" />

			<MemberAbsences subscribes={data.memberProfile.subscribes} />
			<MemberProfileStatus member={data.memberProfile} />

			{#if data.member?.roles.includes('admin') && !data.memberProfile.roles.includes('owner')}
				<DropDown hideOnBlur tippyProps={{ arrow: true }}>
					<button slot="activator" class="btn btn-sm ml-2 whitespace-nowrap">
						<MemberRole roles={data.memberProfile.roles} mode="contents" />
						{#if data.memberProfile.isValidedByEvent}
							<Icon
								path={mdiCheck}
								class="fill-success"
								title="Membre approuvé par l'organisation"
							/>
						{:else}
							<Icon
								path={mdiClose}
								class="fill-error"
								title="Membre non approuvé par l'organisation"
							/>
						{/if}
					</button>

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
						<Icon path={mdiTrashCanOutline} size={20} class="fill-error" />
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
				on:click={() => createSubscribeDialog.showModal()}
			>
				<Icon
					path={mdiClipboardTextOutline}
					size={20}
					title="Inscrire {data.memberProfile.firstName} à un secteur"
				/>
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
	classBody="pt-4"
	let:close
>
	<MemberContactForm member={data.memberProfile} on:success={() => close()} />
</Drawer>
