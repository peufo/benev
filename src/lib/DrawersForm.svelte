<script lang="ts">
	import { UserRoundPlusIcon } from '@lucide/svelte'
	import { Drawer, param } from 'fuma'
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
	import { dev } from '$app/env'

	let periodDrawer: PeriodDrawer = $state()!
	let periodForm: PeriodForm = $state()!
	let inviteForm: InviteForm = $state()!

	interface Props {
		event: Event & { memberFields: Field[] }
		period?: Partial<FormDataPeriod>
		tag?: Partial<Tag> | null
	}

	let { event, period = {}, tag = null }: Props = $props()

	// L'ordre des paramètres de l'URL est l'ordre d'ouverture des tiroirs: `urlParam.with()`
	// ajoute une clé nouvelle en fin et laisse les autres en place.
	let openedKeys = $derived([...param.keys()])
	let teamIndex = $derived(openedKeys.indexOf('form_team'))
	let inviteIndex = $derived(openedKeys.indexOf('form_invite'))

	/**
	 * Les deux tiroirs se renvoient l'un à l'autre: celui du dessus cache le champ qui rouvrirait
	 * celui du dessous, sinon la pile n'aurait pas de fond. Un sujet fermé (`-1`) compte comme
	 * étant au-dessus: sa clé quitte l'URL avant son démontage, et le champ ne doit pas revenir
	 * le temps qu'il glisse. Chaque drapeau ne part qu'au tiroir dont il porte la clé — le
	 * `TeamForm` de la page, lui, garde toujours ses responsables.
	 */
	const isAbove = (subject: number, other: number) =>
		other !== -1 && (subject === -1 || other < subject)

	let teamOverInvite = $derived(isAbove(teamIndex, inviteIndex))
	let inviteOverTeam = $derived(isAbove(inviteIndex, teamIndex))

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
			bind:this={inviteForm}
			{event}
			hideLeaderOf={inviteOverTeam}
			onCreate={async (member) => {
				updateActiveTeamForm((t) => ({ ...t, leaders: [...(t.leaders || []), member] }))
				periodDrawer?.selectMember(member)
				await close()
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
			hideLeaders={teamOverInvite}
			oncreated={async (team) => {
				// Lu avant la fermeture, qui retire la clé de l'URL et l'ordre avec.
				const fromInviteForm = teamOverInvite
				await close()
				// Quitter la page emporterait l'invitation en cours: le secteur créé rejoint le champ
				// qui a ouvert ce tiroir.
				if (fromInviteForm) return inviteForm?.selectTeam(team)
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
