<script lang="ts">
	import { enhance } from '$app/forms'
	import { useForm } from '$lib/form'
	import { InputRelations, InputText, InputTextarea } from '$lib/material/input'
	import { api } from '$lib/api'

	let klass = ''
	export { klass as class }
	const form = useForm({ successUpdate: false })
</script>

<form method="post" class="{klass} flex flex-col gap-2" use:enhance={form.submit}>
	<h3 class="font-bold text-lg">Nouvel équipe</h3>

	<InputText key="name" label="Nom de l'équipe" />
	<InputRelations
		key="leaders"
		label="Responsables"
		getItems={api.user.findMany}
		search={api.user.search}
		getLabel={(user) => `${user.firstName} ${user.lastName}`}
	/>
	<InputTextarea key="description" label="Description" />

	<div class="flex gap-2">
		<a class="btn btn-ghost" href="./">Annuler</a>
		<div class="grow"></div>
		<button class="btn">Valider</button>
	</div>
</form>
