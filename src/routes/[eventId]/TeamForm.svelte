<script lang="ts">
	import { enhance } from '$app/forms'
	import { useForm } from '$lib/form'
	import InputRelations from '$lib/material/input/InputRelations.svelte'
	import InputText from '$lib/material/input/InputText.svelte'
	import { api } from '$lib/api'

	let klass = ''
	export { klass as class }
	export let callback: () => unknown = () => {}
	const form = useForm(callback)
</script>

<form
	method="post"
	action="?/new_event"
	class="{klass} flex flex-col gap-2"
	use:enhance={form.submit}
>
	<h3 class="font-bold text-lg">Nouvel équipe</h3>

	<InputText key="name" label="Nom de l'équipe" />
	<InputRelations
		key="leaders"
		label="Responsables"
		getItems={api.user.findMany}
		search={api.user.search}
		getLabel={(user) => `${user.firstName} ${user.lastName}`}
	/>

	<div class="flex justify-end">
		<button class="btn">Valider</button>
	</div>
</form>
