<script lang="ts">
	import { enhance } from '$app/forms'
	import { useForm } from '$lib/form'
	import { InputRelations, InputText, InputTextarea } from '$lib/material/input'
	import { api } from '$lib/api'
	import type { Team, Leader, User } from '@prisma/client'
	import { eventPath } from '$lib/store'

	let klass = ''
	export { klass as class }
	export let isUpdate = false
	export let team: (Team & { leaders: (Leader & { user: User })[] }) | undefined = undefined

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
		getItems={api.user.findMany}
		search={api.user.search}
		getLabel={(user) => `${user.firstName} ${user.lastName}`}
		value={team?.leaders.map((l) => l.user)}
	/>
	<InputTextarea key="description" label="Description" value={team?.description || ''} />

	<div class="flex gap-2 flex-row-reverse">
		<button class="btn" formaction={isUpdate ? '?/update' : ''} type="submit"> Valider </button>
		{#if isUpdate}
			<button class="btn btn-error btn-outline" formaction="?/delete"> Supprimer </button>
		{/if}
		<div class="grow" />
		<a class="btn btn-ghost" href="{$eventPath}/teams">Annuler</a>
	</div>
</form>
