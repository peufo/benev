<script lang="ts">
	import type { Team } from '@prisma/client'
	import { api } from '$lib/api'
	import { Dialog, InputRelations } from '$lib/material'

	export let title = 'Secteur à charges'
	export let dialog: HTMLDialogElement
	export let teams: Team[]
</script>

<Dialog bind:dialog>
	<h2 slot="header" class="title">{title}</h2>
	<InputRelations
		search={(search) => $api.team.search(search, 10)}
		flatMode
		placeholder="Chercher un secteur"
		classList="max-h-80 overflow-y-auto relative"
		items={teams}
	>
		<svelte:fragment slot="badge" let:item>
			<span>{item.name}</span>
		</svelte:fragment>

		<svelte:fragment slot="listItem" let:item>
			<span>{item.name}</span>
		</svelte:fragment>
	</InputRelations>
</Dialog>
