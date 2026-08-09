<script lang="ts">
	import { UserRoundPlusIcon } from '@lucide/svelte'
	import { Drawer } from 'fuma'
	import InviteForm from './InviteForm.svelte'
	import { TeamForm, type TeamFormInstance } from './team'
	import { PeriodDrawer, PeriodForm } from './period'
	import type { Event, Field, Tag } from '@prisma/client'
	import { TagForm } from './tag'
	import type { FormDataPeriod, TeamWithComputedValues } from './server'
	import MemberImportDialog from './member/MemberImportDialog.svelte'

	let teamForm: TeamFormInstance = $state()!
	let periodDrawer: PeriodDrawer = $state()!
	let periodForm: PeriodForm = $state()!

	interface Props {
		event: Event & { memberFields: Field[] }
		team?: Partial<TeamWithComputedValues> | null
		period?: Partial<FormDataPeriod>
		tag?: Partial<Tag> | null
	}

	let { event, team = null, period = {}, tag = null }: Props = $props()

	let importDialog: HTMLDialogElement = $state()!

	function openImportDialog() {
		importDialog.showModal()
	}
</script>

<Drawer key="form_invite" title="Inviter un nouveau membre" class="surface-drawer">
	{#snippet children({ close })}
		<InviteForm
			onCreate={async (member) => {
				teamForm?.update((t) => ({ ...t, leaders: [...(t.leaders || []), member] }))
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

<Drawer
	key="form_team"
	title="{team?.id ? 'Modifier le' : 'Nouveau'} secteur"
	maxWidth="26em"
	class="surface-drawer "
>
	{#snippet children({ close })}
		<TeamForm bind:teamForm team={team || {}} {event} onsuccess={() => close()} />
	{/snippet}
</Drawer>

<PeriodDrawer bind:this={periodDrawer} bind:periodForm {period} />

<Drawer
	key="form_tag"
	title="{tag?.id ? "Modifier l'" : 'Nouvelle '} étiquette"
	maxWidth="400px"
	class="surface-drawer "
>
	{#snippet children({ close })}
		<TagForm
			tag={tag || {}}
			oncreated={async (tag) => {
				await close({ replaceState: true })
				periodForm.selectTag(tag)
			}}
			onupdated={() => close()}
			ondeleted={() => close()}
		/>
	{/snippet}
</Drawer>
