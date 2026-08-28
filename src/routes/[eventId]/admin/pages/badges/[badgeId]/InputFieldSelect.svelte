<script lang="ts">
	import { PlusIcon } from '@lucide/svelte'
	import { InputSelect, tip, urlParam } from 'fuma'
	import type { Field, FieldType } from '@prisma/client'
	import type { RemoteFormField } from '@sveltejs/kit'
	import { searchMemberFields } from '$lib/member/memberField.remote'
	import MemberFieldSnippet from './MemberFieldSnippet.svelte'

	interface Props {
		/** Le formulaire vit dans `BadgeForm`: c'est lui qui passe le champ à alimenter. */
		field: RemoteFormField<string>
		label: string
		/** `null` et non `undefined`: c'est ce que Prisma rend pour une relation absente. */
		value: Field | null
		type: FieldType
		typesAccepted?: FieldType[]
		oninput?: (memberField: Field) => void
	}

	let {
		field,
		label,
		value = $bindable(),
		type,
		typesAccepted = [type],
		oninput = () => {},
	}: Props = $props()

	// `InputSelect` n'appelle sa recherche qu'avec `{ search }`: le filtre par type est
	// propre à cette instance, il se fixe ici.
	const searchItems = ({ search }: { search: string }) =>
		searchMemberFields({ search, types: typesAccepted })
</script>

<InputSelect
	{field}
	{label}
	value={value ?? undefined}
	nullable
	items={searchItems}
	onSelect={(memberField) => {
		value = memberField ?? null
		if (memberField) oninput(memberField)
	}}
>
	{#snippet selected(memberField)}
		<MemberFieldSnippet field={memberField} updateLink />
	{/snippet}
	{#snippet proposal(memberField)}
		<MemberFieldSnippet field={memberField} />
	{/snippet}
	{#snippet append({ hide })}
		<a
			onclick={hide}
			href={urlParam.with({ form_field: JSON.stringify({ type }) })}
			class="btn btn-square btn-soft btn-sm"
			data-sveltekit-noscroll
			data-sveltekit-replacestate
			use:tip={{ content: 'Nouveau champ' }}
		>
			<PlusIcon size={20} />
		</a>
	{/snippet}
</InputSelect>
