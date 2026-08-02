<script lang="ts">
	import { PlusIcon } from '@lucide/svelte'
	import type { RemoteQueryFunction } from '@sveltejs/kit'
	import { InputRelation, tip, urlParam } from 'fuma'
	import type { Field, FieldType } from '@prisma/client'
	import { searchMemberFields } from '$lib/member/memberField.remote'
	import MemberFieldSnippet from './MemberFieldSnippet.svelte'

	interface Props {
		key: string
		label: string
		/** `null` et non `undefined`: c'est ce que Prisma rend pour une relation absente. */
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

	// `InputRelation` n'appelle sa recherche qu'avec `{ search }`: le filtre par type est
	// propre à cette instance, il se fixe ici.
	const searchItems: RemoteQueryFunction<{ search: string }, Field[]> = ({ search }) =>
		searchMemberFields({ search, types: typesAccepted })
</script>

<!-- `InputRelation` ne sert qu'à choisir: la remote function n'attend que l'id, transmis par
     ce champ caché. -->
<input type="hidden" name={key} value={value?.id ?? ''} />

<InputRelation
	{label}
	value={value ?? undefined}
	nullable
	{searchItems}
	onSelect={(field) => {
		value = field ?? null
		if (field) oninput(field)
	}}
>
	{#snippet selected(field)}
		<MemberFieldSnippet {field} updateLink />
	{/snippet}
	{#snippet proposal(field)}
		<MemberFieldSnippet {field} />
	{/snippet}
	{#snippet append()}
		<a
			href={urlParam.with({ form_field: JSON.stringify({ type }) })}
			class="btn btn-square btn-soft btn-sm"
			data-sveltekit-noscroll
			data-sveltekit-replacestate
			use:tip={{ content: 'Nouveau champ' }}
		>
			<PlusIcon size={20} />
		</a>
	{/snippet}
</InputRelation>
