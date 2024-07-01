<script lang="ts">
	import { Drawer } from 'fuma'
	import InviteForm from './InviteForm.svelte'
	import { TeamForm, type TeamFormInstance, type TeamWithLeaders } from './team'
	import { PeriodDrawer } from './period'
	import type { Event, Field, Period, Subscribe } from '@prisma/client'

	let teamForm: TeamFormInstance
	let periodDrawer: PeriodDrawer

	export let event: Event & { memberFields: Field[] }
	export let team: Partial<TeamWithLeaders> | null = null
	export let period: Partial<Period & { subscribes: Subscribe[] }> | null = null
</script>

<Drawer key="form_invite" title="Inviter un nouveau membre" let:close>
	<InviteForm
		on:created={async ({ detail: member }) => {
			teamForm?.update((t) => ({ ...t, leaders: [...(t.leaders || []), member] }))
			periodDrawer?.selectMember(member)
			await close()
		}}
	/>
</Drawer>

<Drawer key="form_team" title="{team ? 'Modifier le' : 'Nouveau'} secteur" let:close>
	<TeamForm bind:teamForm team={team || {}} {event} on:success={() => close()} />
</Drawer>

<PeriodDrawer bind:this={periodDrawer} {period} />
