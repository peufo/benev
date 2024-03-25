<script lang="ts">
	import type { SuggestionItem } from '$lib/material/input/textRich/suggestion'
	import PageForm from './PageForm.svelte'

	export let data

	const memberSuggestionItems: SuggestionItem[] = [
		{ id: 'firstName', label: 'Prénom' },
		{ id: 'lastName', label: 'Nom de famille' },
		{ id: 'name', label: 'Nom et prénom' },
		{ id: 'age', label: 'Age' },
		{ id: 'address', label: 'Address' },
		{ id: 'subscribes', label: 'Liste des inscriptions' },
		{ id: 'nbSubscribe', label: "Nombre d'inscriptions" },
		{ id: 'hours', label: 'Heures de travail'},
		{ id: 'teams_work', label: 'Liste des secteurs de travail' },
		{ id: 'teams_leader', label: 'Liste des secteurs à charge' },
		{ id: 'nbTeams', label: 'Nombre de secteurs' },
		...data.event.memberFields.map(field => ({ id: `field_${field.id}`, label: field.name}))
	]
</script>

<PageForm
	page={data.page}
	charterAlreadyExist={!!data.pages.find((p) => p.type === 'charter')}
	{memberSuggestionItems}
/>
