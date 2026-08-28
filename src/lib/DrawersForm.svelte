<script lang="ts">
	import { UserRoundPlusIcon } from '@lucide/svelte'
	import { Drawer } from 'fuma'
	import { goto } from '$app/navigation'
	import { page } from '$app/state'
	import InviteForm from './InviteForm.svelte'
	import { TeamForm } from './team'
	import { PeriodDrawer } from './period'
	import type { Event, Field, Tag } from '@prisma/client'
	import { TagForm } from './tag'
	import type { FormDataPeriod } from './server'
	import { eventPath } from '$lib/eventPath'
	import { inviteCall, tagCall, teamCall } from '$lib/drawerCall.svelte'
	import MemberImportDialog from './member/MemberImportDialog.svelte'
	import { dev } from '$app/env'

	interface Props {
		event: Event & { memberFields: Field[] }
		period?: Partial<FormDataPeriod>
		tag?: Partial<Tag> | null
	}

	let { event, period = {}, tag = null }: Props = $props()

	let importDialog: HTMLDialogElement = $state()!

	function openImportDialog() {
		importDialog.showModal()
	}
</script>

{#if dev}
	<MemberImportDialog bind:dialog={importDialog} />
{/if}

<Drawer key="form_invite" title="Inviter un nouveau membre" class="surface-drawer">
	{#snippet children({ close })}
		<InviteForm
			{event}
			openedFrom={inviteCall.current?.from}
			onCreate={async (member) => {
				const caller = inviteCall.current
				await close()
				caller?.oncreated?.(member)
			}}
		/>
		{#if dev}
			<button class="menu-item" onclick={openImportDialog}>
				<UserRoundPlusIcon size={20} />
				<span>Importer des membres</span>
			</button>
		{/if}
	{/snippet}
</Drawer>

<!-- Création seulement: un secteur existant s'édite dans son volet, sur `/admin/teams/[teamId]`. -->
<Drawer key="form_team" title="Nouveau secteur" maxWidth="26em" class="surface-drawer">
	{#snippet children({ close })}
		<TeamForm
			team={{}}
			{event}
			openedFrom={teamCall.current?.from}
			oncreated={async (team) => {
				// Lu avant la fermeture, qui retire de l'URL la clé dont dépend `current`.
				const caller = teamCall.current
				await close()
				// Quitter la page emporterait le formulaire qui attend ce secteur.
				if (caller?.oncreated) return caller.oncreated(team)
				// Créer un secteur depuis le planning ne doit pas quitter le planning: seule la
				// page d'administration des secteurs suit la création jusqu'à son volet.
				if (page.route.id?.startsWith('/[eventId]/admin/teams'))
					await goto(eventPath('/admin/teams/[teamId]', { teamId: team.id }))
			}}
		/>
	{/snippet}
</Drawer>

<PeriodDrawer {period} />

<Drawer
	key="form_tag"
	title="{tag?.id ? "Modifier l'" : 'Nouvelle '} étiquette"
	maxWidth="400px"
	class="surface-drawer"
>
	{#snippet children({ close })}
		<!-- L'appelant est lu avant chaque fermeture, qui retire de l'URL la clé dont il dépend. -->
		<TagForm
			tag={tag || {}}
			oncreated={async (tag) => {
				const caller = tagCall.current
				await close({ replaceState: true })
				caller?.oncreated?.(tag)
			}}
			onupdated={async (tag) => {
				const caller = tagCall.current
				await close()
				caller?.onupdated?.(tag)
			}}
			ondeleted={async (tagId) => {
				const caller = tagCall.current
				await close()
				caller?.ondeleted?.(tagId)
			}}
		/>
	{/snippet}
</Drawer>
