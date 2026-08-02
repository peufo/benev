<script lang="ts">
	import { component } from '$lib/ui'
	import { InputRelation } from '$lib/fuma-legacy'
	import { urlParam } from 'fuma'
	import type { Field, FieldType } from '@prisma/client'
	import { api } from '$lib/api'
	import MemberFieldSnippet from './MemberFieldSnippet.svelte'

	interface Props {
		key: string
		label: string
		value: Field | null
		type: FieldType
		typesAccepted?: FieldType[]
		oninput?: (field: Field) => void
	}

	let {
		key,
		label,
		value = $bindable(),
		type,
		typesAccepted = [type],
		oninput = () => {},
	}: Props = $props()
</script>

<!-- `InputRelation` de fuma 1 sérialise l'objet entier en JSON: la remote function n'attend
     que l'id, transmis par le champ caché. Le champ interne du composant porte un autre nom,
     que le schéma écarte. -->
<input type="hidden" name={key} value={value?.id ?? ''} />

<InputRelation
	key="{key}_search"
	{label}
	bind:value
	search={(search) => $api.fields.search(search, { types: typesAccepted })}
	createTitle="Nouveau champ"
	createUrl={urlParam.with({ form_field: JSON.stringify({ type }) })}
	slotItem={(field) => component(MemberFieldSnippet, { field, updateLink: true })}
	slotSuggestion={(field) => component(MemberFieldSnippet, { field })}
	oninput={(value) => oninput(value)}
/>
