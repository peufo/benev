<script lang="ts">
	import { Drawer } from 'fuma'
	import InviteForm from './InviteForm.svelte'
	import { TeamForm, type TeamFormInstance, type TeamWithLeaders } from './team'
	import { PeriodDrawer, PeriodForm } from './period'
	import type { Event, Field, Tag } from '@prisma/client'
	import { TagForm } from './tag'
	import type { FormDataPeriod } from './server'

	let teamForm: TeamFormInstance
	let periodDrawer: PeriodDrawer
	let periodForm: PeriodForm

	export let event: Event & { memberFields: Field[] }
	export let team: Partial<TeamWithLeaders> | null = null
	export let period: Partial<FormDataPeriod> = {}

	export let tag: Partial<Tag> | null = null
</script>

<Drawer key="form_invite" title="Inviter un nouveau membre" let:close>
	<InviteForm
		onCreate={async (member) => {
			teamForm?.update((t) => ({ ...t, leaders: [...(t.leaders || []), member] }))
			periodDrawer?.selectMember(member)
			await close()
		}}
	/>
</Drawer>

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
