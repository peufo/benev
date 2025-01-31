<script lang="ts">
	import { component, Form, InputBoolean, Placeholder, USE_COERCE_JSON } from 'fuma'
	import LabelPage from './LabelPage.svelte'
	import LabelField from './LabelField.svelte'
	import CloneSelector from './CloneSelector.svelte'
	export let data

	function mapSelected<T>(arr: T[], selected = true): (T & { selected: boolean })[] {
		return arr.map((el) => ({ ...el, selected }))
	}
	function getJsonIds(arr: { id: string; selected: boolean }[]): string {
		return [
			USE_COERCE_JSON,
			JSON.stringify(arr.filter((el) => el.selected).map((el) => el.id)),
		].join('')
	}

	let pages = mapSelected(data.event.pages)
	let fields = mapSelected(data.event.memberFields)
	let views = mapSelected(data.event.views)
</script>

<h2 class="title">Cloner l'évènement "{data.event.name}"</h2>

<Form action="?/event_clone" simpleAction>
	<div class="grid grid-cols-2 gap-6 mt-4">
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
			class="col-span-2"
			items={data.event.views}
			key="views"
			legend="Vues"
			labelAll="Toutes les vues"
			placeholder="Aucune vue"
			getLabel={(view) => `${view.name} (${view.key})`}
		/>

		<fieldset style="border: 1px solid #bbb" class="p-2 rounded">
			<legend class="px-2">Secteurs</legend>
		</fieldset>
	</div>
</Form>
