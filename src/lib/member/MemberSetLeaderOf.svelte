<script lang="ts">
	import type { Team } from '@prisma/client'
	import { enhance } from '$app/forms'

	import { api } from '$lib/api'
	import { Dialog, InputRelations } from '$lib/material'
	import { useForm } from '$lib/validation'
	import { eventPath } from '$lib/store'

	export let title = 'Secteur à charges'
	export let dialog: HTMLDialogElement
	export let teams: Team[]
	export let memberId: string

	const form = useForm({
		successCallback() {
			dialog.close()
		},
	})
</script>

<Dialog bind:dialog on:open={() => (teams = teams)}>
	<h2 slot="header" class="title">{title}</h2>
	<form
		action="{$eventPath}/admin/members/{memberId}?/set_leader_of"
		method="post"
		use:enhance={form.submit}
	>
		<InputRelations
			key="leaderOf"
			flatMode
			search={(search) => $api.team.search(search, { take: 10 })}
			placeholder="Chercher un nouveau secteur"
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

		<div class="flex flex-row-reverse mt-2">
			<button class="btn"> Valider </button>
		</div>
	</form>
</Dialog>
