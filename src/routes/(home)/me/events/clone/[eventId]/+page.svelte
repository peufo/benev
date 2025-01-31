<script lang="ts">
	import { component, Form, InputBoolean, selector, USE_COERCE_JSON } from 'fuma'
	import LabelPage from './LabelPage.svelte'
	import type { Field, Page } from '@prisma/client'
	import LabelField from './LabelField.svelte'
	export let data

	function mapSelected<T>(arr: T[], selected = true): (T & { selected: boolean })[] {
		return arr.map((el) => ({ ...el, selected }))
	}
	function getJson(arr: { id: string; selected: boolean }[]): string {
		return [
			USE_COERCE_JSON,
			JSON.stringify(arr.filter((el) => el.selected).map((el) => el.id)),
		].join('')
	}

	let pages = mapSelected(data.event.pages)
	let fields = mapSelected(data.event.memberFields)
</script>

<h2 class="title">Cloner "{data.event.name}"</h2>

<Form action="?/event_clone" simpleAction>
	<div class="grid grid-cols-2 gap-6 mt-4">
		<input type="hidden" name="fields" value={getJson(fields)} />
		<input type="hidden" name="pages" value={getJson(pages)} />

		<!-- PUBLICATIONS -->
		<fieldset style="border: 1px solid #bbb" class="p-2 rounded">
			<legend class="px-2">Publications</legend>
			<InputBoolean
				key="pages_all"
				value={pages.filter((p) => p.selected).length === data.event.pages.length}
				on:change={({ detail: selected }) => (pages = mapSelected(pages, selected))}
				label="Toutes les publications"
				labelPosition="right"
			/>
			<div class="divider" />
			{#each pages as page}
				<InputBoolean
					key="page_{page.id}"
					bind:value={page.selected}
					label={component(LabelPage, { page })}
					labelPosition="right"
				/>
			{/each}
		</fieldset>

		<!-- MEMBER FIELDS -->
		<fieldset style="border: 1px solid #bbb" class="p-2 rounded">
			<legend class="px-2">Champs de membre</legend>
			<InputBoolean
				key="fields_all"
				value={fields.filter((p) => p.selected).length === data.event.memberFields.length}
				on:change={({ detail: selected }) => (fields = mapSelected(fields, selected))}
				label="Tous les champe de membres"
				labelPosition="right"
			/>
			<div class="divider" />
			{#each fields as field}
				<InputBoolean
					key="field_{field.id}"
					bind:value={field.selected}
					label={component(LabelField, { field })}
					labelPosition="right"
				/>
			{/each}
		</fieldset>
	</div>
</Form>
