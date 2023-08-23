<script lang="ts">
	import { enhance } from '$app/forms'
	import { useForm } from '$lib/form'
	import { InputRelations, InputText, InputTextarea , DeleteButton} from '$lib/material'
	import { api } from '$lib/api'
	import type { Team, Member, User } from '@prisma/client'
	import { eventPath } from '$lib/store'

	let klass = ''
	export { klass as class }
	export let isUpdate = false
	export let team: (Team & { leaders: (Member & { user: User })[] }) | undefined = undefined

	const form = useForm({ successUpdate: false })
</script>

<form method="post" class="{klass} flex flex-col gap-2" use:enhance={form.submit}>
	{#if isUpdate}
		<h3 class="font-bold text-lg">Modification du secteur</h3>
	{:else}
		<h3 class="font-bold text-lg">Nouveau secteur</h3>
	{/if}

	<InputText key="name" label="Nom du secteur" value={team?.name} />
	<InputRelations
		key="leaders"
		label="Responsables"
		placeholder="Chercher un membre"
		getItems={$api.member.findMany}
		search={$api.member.search}
		getLabel={(member) => `${member.user.firstName} ${member.user.lastName}`}
		value={team?.leaders}
	/>
	<InputTextarea key="description" label="Description" value={team?.description || ''} />

	<div class="flex gap-2 flex-row-reverse">
		<button class="btn" formaction={isUpdate ? '?/update' : ''} type="submit"> Valider </button>
		{#if isUpdate}
			<DeleteButton formaction="?/delete"/>
		{/if}
		<div class="grow" />
		<a class="btn btn-ghost" href="{$eventPath}/teams">Annuler</a>
	</div>
</form>
