<script lang="ts">
	import {
		mdiArchiveOutline,
		mdiArrowLeft,
		mdiEmailOutline,
		mdiFacebook,
		mdiInstagram,
		mdiMapMarkerOutline,
		mdiPhoneOutline,
		mdiTestTube,
		mdiWeb,
	} from '@mdi/js'

	import { Card, Drawer, Icon } from 'fuma'
	import { eventPath } from '$lib/store'
	import { Header, Footer, AdminNavigation } from '$lib/layout'
	import InviteForm from '$lib/InviteForm.svelte'
	import { TeamForm, type TeamFormInstance } from '$lib/team'
	import { MemberFieldForm } from '$lib/member'
	import { PeriodDrawer } from '$lib/period'
	import EventMenu from './EventMenu.svelte'
	import FooterLink from './FooterLink.svelte'
	import EventTheme from './admin/theme/EventTheme.svelte'

	export let data

	$: accessGranted =
		data.event.state === 'published' || data.member?.roles.includes('leader') || data.userIsRoot

	let teamForm: TeamFormInstance
	let periodDrawer: PeriodDrawer
</script>

<svelte:head>
	<title>Benev.io - {data.event.name}</title>
</svelte:head>

<EventTheme event={data.event} />

<Header user={data.user}>
	<a
		slot="start"
		href="{$eventPath}/me"
		class="
			text-lg hover:bg-base-200 h-12 px-2 flex items-center gap-2 rounded-lg
			whitespace-nowrap overflow-hidden overflow-ellipsis min-w-0
		"
	>
		{#if data.event.logoId}
			<img
				class="inline-block h-10 mx-1"
				src="/media/{data.event.logoId}?size=medium"
				alt="logo of {data.event.name}"
			/>
		{:else if data.event.icon}
			<img class="inline-block w-5 mx-1" src={data.event.icon} alt="icon of {data.event.name}" />
		{/if}
		<span class="whitespace-nowrap overflow-hidden overflow-ellipsis min-w-0">
			{data.event.name}
		</span>
	</a>

	<svelte:fragment slot="end">
		{#if accessGranted}
			<EventMenu pages={data.pages} />
		{/if}
	</svelte:fragment>
</Header>

<div class="flex grow items-start relative">
	{#if data.member?.roles.includes('leader')}
		<AdminNavigation />
	{/if}

	<main class="grow mx-auto overflow-x-hidden self-stretch p-2 sm:p-4">
		{#if accessGranted}
			<slot />
		{:else if data.event.state === 'draft' || data.event.state === 'actived'}
			<Card class="max-w-lg mx-auto">
				<h2 slot="title" class="flex gap-2">
					<Icon path={mdiTestTube} class="rotate-12 opacity-70" />

					<span>Bientôt disponible</span>
				</h2>

				<p class="mt-4">
					L'espace bénévole de l'évènement <b>{data.event.name}</b> est cours d'élaboration.
				</p>

				<div class="mt-8">
					<a href="/me" class="btn btn-sm">
						<Icon path={mdiArrowLeft} />
						<span>mon profil</span>
					</a>
				</div>
			</Card>
		{:else}
			<Card class="max-w-lg mx-auto">
				<h2 slot="title" class="flex gap-2">
					<Icon path={mdiArchiveOutline} class="opacity-70" />
					<span>Cet évènement est archivé</span>
				</h2>

				<div class="mt-8">
					<a href="/me" class="btn btn-sm">
						<Icon path={mdiArrowLeft} />
						<span>mon profil</span>
					</a>
				</div>
			</Card>
		{/if}
	</main>
</div>

<Footer>
	<div class="flex flex-wrap justify-center">
		<FooterLink link={data.event.web}>
			<svelte:fragment slot="icon">
				{#if data.event.icon}
					<img
						class="inline-block w-5 mx-1"
						src={data.event.icon}
						alt="logo of {data.event.name}"
					/>
				{:else}
					<Icon path={mdiWeb} />
				{/if}
			</svelte:fragment>
		</FooterLink>

		<FooterLink link={data.event.facebook} icon={mdiFacebook} let:label>
			{label.replace(/^facebook.com\//, '')}
		</FooterLink>
		<FooterLink link={data.event.instagram} icon={mdiInstagram} let:label>
			{label.replace(/^instagram.com\//, '')}
		</FooterLink>

		<FooterLink link={data.event.email} protocol="mailto:" icon={mdiEmailOutline} />
		<FooterLink link={data.event.phone} protocol="tel:" icon={mdiPhoneOutline} />

		<FooterLink
			link={data.event.address}
			protocol="https://www.google.com/maps/place/"
			icon={mdiMapMarkerOutline}
		>
			{data.event.address}
		</FooterLink>
	</div>
</Footer>

{#if data.member?.roles.includes('leader')}
	<Drawer key="form_invite" title="Inviter un nouveau membre" let:close>
		<InviteForm
			on:created={async ({ detail: member }) => {
				console.log(teamForm)
				teamForm?.update((team) => ({ ...team, leaders: [...(team.leaders || []), member] }))
				periodDrawer?.selectMember(member)
				await close()
			}}
		/>
	</Drawer>

	<Drawer key="form_team" title="{data.team ? 'Modifier le' : 'Nouveau'} secteur" let:close>
		<TeamForm bind:teamForm team={data.team || {}} event={data.event} on:success={() => close()} />
	</Drawer>

	<Drawer key="form_field" title="{data.field ? 'Modifier le' : 'Nouveau'} champ" let:close>
		<MemberFieldForm field={data.field || {}} on:success={() => close()} />
	</Drawer>

	<PeriodDrawer bind:this={periodDrawer} period={data.period} />
{/if}
