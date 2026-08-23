<script lang="ts">
	import { UserRoundPlusIcon } from '@lucide/svelte'
	import { Drawer } from 'fuma'
	import { goto } from '$app/navigation'
	import { page } from '$app/state'
	import InviteForm from './InviteForm.svelte'
	import { TeamForm } from './team'
	import { updateActiveTeamForm } from './team/teamFormActive.svelte'
	import { PeriodDrawer, PeriodForm } from './period'
	import type { Event, Field, Tag } from '@prisma/client'
	import { TagForm } from './tag'
	import type { FormDataPeriod } from './server'
	import { eventPath } from '$lib/eventPath'
	import MemberImportDialog from './member/MemberImportDialog.svelte'

	let periodDrawer: PeriodDrawer = $state()!
	let periodForm: PeriodForm = $state()!

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

<Drawer key="form_invite" title="Inviter un nouveau membre" class="surface-drawer">
	{#snippet children({ close })}
		<InviteForm
			{event}
			onCreate={async (member) => {
				updateActiveTeamForm((t) => ({ ...t, leaders: [...(t.leaders || []), member] }))
				periodDrawer?.selectMember(member)
				await close()
			}}
		/>

		<button class="menu-item" onclick={openImportDialog}>
			<UserRoundPlusIcon size={20} />
			<span>Importer des membres</span>
		</button>
	{/snippet}
</Drawer>

<!--
	TODO: remove this import members dialogue
	instead, improve InviteForm like this:
	- Invite form include member.profil part
	- The event can be linked to previous events
	- Each fields can be linked other event.field (filled if clone, editable)
	- Events linked members (only one per account (more recent)) is proposed whene user tap email name or lastName
	- Select a member autofill profil

	NOTE: Le clonnage des vues est certainement peté à cause des fieldId
-->

<MemberImportDialog bind:dialog={importDialog} />

<!-- Création seulement: un secteur existant s'édite dans son volet, sur `/admin/teams/[teamId]`. -->
<Drawer key="form_team" title="Nouveau secteur" maxWidth="26em" class="surface-drawer">
	{#snippet children({ close })}
		<TeamForm
			team={{}}
			{event}
			oncreated={async (team) => {
				await close()
				// Créer un secteur depuis le planning ne doit pas quitter le planning: seule la
				// page d'administration des secteurs suit la création jusqu'à son volet.
				if (page.route.id?.startsWith('/[eventId]/admin/teams'))
					await goto(eventPath('/admin/teams/[teamId]', { teamId: team.id }))
			}}
		/>
	{/snippet}
</Drawer>

<PeriodDrawer bind:this={periodDrawer} bind:periodForm {period} />

<Drawer
	key="form_tag"
	title="{tag?.id ? "Modifier l'" : 'Nouvelle '} étiquette"
	maxWidth="400px"
	class="surface-drawer"
>
	{#snippet children({ close })}
		<TagForm
			tag={tag || {}}
			oncreated={async (tag) => {
				await close({ replaceState: true })
				periodForm?.selectTag(tag)
			}}
			onupdated={async (tag) => {
				await close()
				periodForm?.updateTag(tag)
			}}
			ondeleted={async (tagId) => {
				await close()
				periodForm?.unselectTag(tagId)
			}}
		/>
	{/snippet}
</Drawer>
