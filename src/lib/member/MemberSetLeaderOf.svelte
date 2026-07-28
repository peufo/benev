<script lang="ts">
	import type { Team } from '@prisma/client'
	import { enhance } from '$app/forms'

	import { api } from '$lib/api'
	import { Dialog, InputRelations } from '$lib/fuma'
	import { useForm } from '$lib/fuma'
	import { eventPath } from '$lib/store'

	interface Props {
		title?: string
		dialog: HTMLDialogElement
		teams: Team[]
		memberId: string
	}

	let {
		title = 'Secteur à charges',
		dialog = $bindable(),
		teams = $bindable(),
		memberId,
	}: Props = $props()

	const form = useForm({
		onSuccess() {
			dialog?.close()
		},
	})
</script>

<Dialog bind:dialog on:open={() => (teams = teams)}>
	{#snippet header()}
		<h2 class="title">{title}</h2>
	{/snippet}
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
