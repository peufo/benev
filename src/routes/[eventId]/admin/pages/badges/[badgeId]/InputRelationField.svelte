<script lang="ts">
	import { component, InputRelation, urlParam } from 'fuma'
	import type { Field, FieldType } from '@prisma/client'
	import { api } from '$lib/api'
	import MemberFieldSnippet from './MemberFieldSnippet.svelte'

	export let key: string
	export let label: string
	export let value: Field | null
	export let type: FieldType
	export let oninput: (field: Field) => void = () => {}
</script>

<InputRelation
	{key}
	{label}
	bind:value
	search={(search) => $api.fields.search(search, { type })}
	createTitle="Nouveau champ"
	createUrl={$urlParam.with({ form_field: JSON.stringify({ type }) })}
	slotItem={(field) => component(MemberFieldSnippet, { field, updateLink: true })}
	slotSuggestion={(field) => component(MemberFieldSnippet, { field })}
	on:input={(event) => oninput(event.detail.value)}
/>
