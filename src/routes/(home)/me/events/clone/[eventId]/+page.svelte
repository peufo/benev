<script lang="ts">
	import { component, Form, InputNumber } from 'fuma'
	import LabelPage from './LabelPage.svelte'
	import LabelField from './LabelField.svelte'
	import CloneSelector from './CloneSelector.svelte'
	import LabelTeam from './LabelTeam.svelte'

	export let data

	let deltaDays = 365
</script>

<h2 class="title">Cloner l'évènement "{data.event.name}"</h2>

<Form action="?/event_clone" simpleAction>
	<div class="grid grid-cols-1 gap-6 mt-4 sm:grid-cols-2">
		<CloneSelector
			class="sm:col-span-2"
			items={data.event.teams}
			key="teams"
			legend="Secteurs"
			labelAll="Tous les secteurs"
			placeholder="Aucun secteur"
			getLabel={(team) => component(LabelTeam, { team, deltaDays })}
		>
			<div class="grow" />
			<InputNumber label="Nombre de jours de décalage" key="deltaDays" bind:value={deltaDays} />
		</CloneSelector>

		<CloneSelector
			items={data.event.pages}
			key="pages"
			legend="Publications"
			labelAll="Toutes les publications"
			placeholder="Aucune pages"
			getLabel={(page) => component(LabelPage, { page })}
		/>

		<CloneSelector
			items={data.event.memberFields}
			key="fields"
			legend="Champs de membres"
			labelAll="Tous les champs de membres"
			placeholder="Aucun champs"
			getLabel={(field) => component(LabelField, { field })}
		/>

		<CloneSelector
			class="sm:col-span-2"
			items={data.event.views}
			key="views"
			legend="Vues"
			labelAll="Toutes les vues"
			placeholder="Aucune vue"
			getLabel={(view) => `${view.name} (${view.key})`}
		/>
	</div>
</Form>
