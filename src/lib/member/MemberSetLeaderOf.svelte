<script lang="ts">
	import type { Team } from '@prisma/client'

	import { Dialog, InputMultiSelect } from 'fuma'
	import { searchTeams } from '$lib/team/team.remote'
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
		{...setMemberLeaderOf.enhance(async ({ submit }) => {
			await submit()
			dialog?.close()
		})}
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

		<div class="flex flex-row-reverse mt-2">
			<button class="btn"> Valider </button>
		</div>
	</form>
</Dialog>
