<script lang="ts">
	import { Drawer, Icon } from 'fuma'
	import InviteForm from './InviteForm.svelte'
	import { TeamForm, type TeamFormInstance } from './team'
	import { PeriodDrawer, PeriodForm } from './period'
	import type { Event, Field, Tag } from '@prisma/client'
	import { TagForm } from './tag'
	import type { FormDataPeriod, TeamWithComputedValues } from './server'
	import MemberImportDialog from './member/MemberImportDialog.svelte'
	import { mdiAccountMultiplePlus } from '@mdi/js'

	let teamForm: TeamFormInstance
	let periodDrawer: PeriodDrawer
	let periodForm: PeriodForm

	export let event: Event & { memberFields: Field[] }
	export let team: Partial<TeamWithComputedValues> | null = null
	export let period: Partial<FormDataPeriod> = {}

	export let tag: Partial<Tag> | null = null

	let importDialog: HTMLDialogElement

	function openImportDialog() {
		importDialog.showModal()
	}
</script>

<Drawer key="form_invite" title="Inviter un nouveau membre" let:close>
	<InviteForm
		onCreate={async (member) => {
			teamForm?.update((t) => ({ ...t, leaders: [...(t.leaders || []), member] }))
			periodDrawer?.selectMember(member)
			await close()
		}}
	/>

	<button class="menu-item" on:click={openImportDialog}>
		<Icon path={mdiAccountMultiplePlus} size={20} />
		<span>Importer des membres</span>
	</button>
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

<Drawer key="form_team" title="{team?.id ? 'Modifier le' : 'Nouveau'} secteur" let:close>
	<TeamForm bind:teamForm team={team || {}} {event} on:success={() => close()} />
</Drawer>

<PeriodDrawer bind:this={periodDrawer} bind:periodForm {period} />

<Drawer
	key="form_tag"
	title="{tag?.id ? "Modifier l'" : 'Nouvelle '} étiquette"
	maxWidth="400px"
	let:close
>
	<TagForm
		tag={tag || {}}
		on:created={async ({ detail: tag }) => {
			await close({ replaceState: true })
			periodForm.updatePeriod((p) => ({ ...p, tags: [...(p.tags || []), tag] }))
		}}
		on:updated={() => close()}
		on:deleted={() => close()}
	/>
</Drawer>
