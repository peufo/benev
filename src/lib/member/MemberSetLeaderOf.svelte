<script lang="ts">
	import type { Team } from '@prisma/client'

	import { Dialog, InputMultiSelect } from 'fuma'
	import { searchTeams } from '$lib/team/team.remote'
	import { enhanceForm } from '$lib/enhanceForm'
	import { setMemberLeaderOf } from './memberAdmin.remote'

	interface Props {
		title?: string
		dialog: HTMLDialogElement
		teams: Team[]
		memberId: string
	}

	let { title = 'Secteur à charges', dialog = $bindable(), teams = $bindable() }: Props = $props()
</script>

<Dialog bind:dialog>
	{#snippet header()}
		<h2 class="title">{title}</h2>
	{/snippet}
	<form
		{...setMemberLeaderOf.enhance(enhanceForm({ onsuccess: () => dialog?.close() }))}
		class="flex gap-2"
	>
		<InputMultiSelect
			field={setMemberLeaderOf.fields.leaderOf}
			items={searchTeams}
			placeholder="Chercher un nouveau secteur"
			bind:value={teams}
		>
			{#snippet selected(team)}
				<span>{team.name}</span>
			{/snippet}
			{#snippet proposal(team)}
				<span>{team.name}</span>
			{/snippet}
		</InputMultiSelect>

		<button class="btn btn-primary"> Valider </button>
	</form>
</Dialog>
