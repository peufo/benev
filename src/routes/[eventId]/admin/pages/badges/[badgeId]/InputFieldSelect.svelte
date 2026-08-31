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
	}

	let { field, label, value = $bindable(), type, typesAccepted = [type] }: Props = $props()

	// `InputSelect` n'appelle sa recherche qu'avec `{ search }`: le filtre par type est
	// propre à cette instance, il se fixe ici.
	const searchItems = ({ search }: { search: string }) =>
		searchMemberFields({ search, types: typesAccepted })
</script>

<!-- Liaison par accesseurs: `InputSelect` cesserait de suivre une valeur passée en simple prop
     dès qu'il y a écrit lui-même, et le parent ne pourrait plus la reprendre. -->
<InputSelect
	{field}
	{label}
	bind:value={() => value ?? undefined, (memberField) => (value = memberField ?? null)}
	nullable
	items={searchItems}
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
