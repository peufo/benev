<script lang="ts">
	import type { Team } from '@prisma/client'
	import { enhance } from '$app/forms'

	import { api } from '$lib/api'
	import { Dialog, InputRelations } from 'fuma'
	import { useForm } from 'fuma/validation'
	import { eventPath } from '$lib/store'

	export let title = 'Secteur à charges'
	export let dialog: HTMLDialogElement
	export let teams: Team[]
	export let memberId: string

	const form = useForm({
		onSuccess() {
			dialog?.close()
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
			value={teams}
			slotItem={(team) => team.name}
		/>

		<div class="flex flex-row-reverse mt-2">
			<button class="btn"> Valider </button>
		</div>
	</form>
</Dialog>
