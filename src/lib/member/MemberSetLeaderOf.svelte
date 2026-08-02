<script lang="ts">
	import type { Team } from '@prisma/client'

	import { Dialog, InputRelations } from 'fuma'
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
	<!-- `InputRelations` ne sert qu'à choisir: les ids partent dans les champs cachés. -->
	<form
		{...setMemberLeaderOf.enhance(async ({ submit }) => {
			await submit()
			dialog?.close()
		})}
	>
		{#each teams ?? [] as team (team.id)}
			<input type="hidden" name="leaderOf[]" value={team.id} />
		{/each}

		<InputRelations
			searchItems={searchTeams}
			placeholder="Chercher un nouveau secteur"
			bind:value={teams}
		>
			{#snippet selected(team)}
				<span>{team.name}</span>
			{/snippet}
			{#snippet proposal(team)}
				<span>{team.name}</span>
			{/snippet}
		</InputRelations>

		<div class="flex flex-row-reverse mt-2">
			<button class="btn"> Valider </button>
		</div>
	</form>
</Dialog>
