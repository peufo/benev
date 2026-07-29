<script lang="ts">
	import type { Team } from '@prisma/client'

	import { api } from '$lib/api'
	import { InputRelations } from '$lib/fuma-legacy'
	import { Dialog } from 'fuma'
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
			key="leaderOf_search"
			flatMode
			search={(search) => $api.team.search(search, { take: 10 })}
			placeholder="Chercher un nouveau secteur"
			classList="max-h-80 overflow-y-auto relative"
			bind:value={teams}
			slotItem={(team) => team.name}
		/>

		<div class="flex flex-row-reverse mt-2">
			<button class="btn"> Valider </button>
		</div>
	</form>
</Dialog>
