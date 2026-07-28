<script lang="ts">
	import { component, InputRelation, urlParam } from '$lib/fuma'
	import type { Field, FieldType } from '@prisma/client'
	import { api } from '$lib/api'
	import MemberFieldSnippet from './MemberFieldSnippet.svelte'

	interface Props {
		key: string;
		label: string;
		value: Field | null;
		type: FieldType;
		typesAccepted?: FieldType[];
		oninput?: (field: Field) => void;
	}

	let {
		key,
		label,
		value = $bindable(),
		type,
		typesAccepted = [type],
		oninput = () => {}
	}: Props = $props();
</script>

<InputRelation
	{key}
	{label}
	bind:value
	search={(search) => $api.fields.search(search, { types: typesAccepted })}
	createTitle="Nouveau champ"
	createUrl={$urlParam.with({ form_field: JSON.stringify({ type }) })}
	slotItem={(field) => component(MemberFieldSnippet, { field, updateLink: true })}
	slotSuggestion={(field) => component(MemberFieldSnippet, { field })}
	on:input={(event) => oninput(event.detail.value)}
/>
