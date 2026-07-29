<script lang="ts">
	import { component } from '$lib/fuma-legacy'
	import LabelPage from './LabelPage.svelte'
	import LabelField from './LabelField.svelte'
	import CloneSelector from './CloneSelector.svelte'
	import LabelTeam from './LabelTeam.svelte'
	import { cloneEvent } from './clone.remote'

	let { data } = $props()

	let deltaDays = $state(365)
</script>

<h2 class="title">Cloner l'évènement "{data.event.name}"</h2>

<form {...cloneEvent} class="flex flex-col gap-4">
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
			<div class="grow"></div>
			<!-- Champ brut: `deltaDays` pilote aussi l'aperçu des dates dans `LabelTeam`. -->
			<label class="floating-label">
				<span>Nombre de jours de décalage</span>
				<input class="input" type="number" name="deltaDays" bind:value={deltaDays} />
			</label>
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

	<div class="flex flex-row-reverse gap-2 border-t pt-4">
		<button class="btn btn-primary">Valider</button>
	</div>
</form>
