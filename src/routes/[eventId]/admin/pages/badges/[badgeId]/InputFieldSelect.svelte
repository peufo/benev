<script lang="ts" module>
	/**
	 * Qui a demandé la création d'un champ. Le tiroir est monté une seule fois par le layout de
	 * l'évènement, et n'annonce le champ créé qu'au global: sans ce jeton, les quatre sélecteurs
	 * de la page reprendraient le même champ. Le contexte du module suffit — il n'y a qu'un
	 * tiroir, donc qu'un demandeur à la fois.
	 */
	let requester: string | undefined = undefined
</script>

<script lang="ts">
	import { onMount } from 'svelte'
	import { PlusIcon } from '@lucide/svelte'
	import { InputSelect, tip, urlParam } from 'fuma'
	import type { Field, FieldType } from '@prisma/client'
	import type { RemoteFormField } from '@sveltejs/kit'
	import { globalEvents } from '$lib/globalEvents'
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

	const uid = $props.id()

	// `InputSelect` n'appelle sa recherche qu'avec `{ search }`: le filtre par type est
	// propre à cette instance, il se fixe ici.
	const searchItems = ({ search }: { search: string }) =>
		searchMemberFields({ search, types: typesAccepted })

	// Le champ créé depuis ce sélecteur y prend place: c'est ce qu'on venait y chercher. Un
	// type rejeté ne s'y met pas — le tiroir laisse en changer après coup.
	onMount(() => {
		const claim = (created: Field) => {
			if (requester !== uid) return
			requester = undefined
			if (typesAccepted.includes(created.type)) value = created
		}
		globalEvents.on('field_created', claim)
		return () => globalEvents.off('field_created', claim)
	})
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
			onclick={() => {
				requester = uid
				hide()
			}}
			href={urlParam.with({ form_field: JSON.stringify({ type }) })}
			class="btn btn-square btn-soft btn-sm"
			data-sveltekit-noscroll
			data-sveltekit-replacestate
			aria-label="Nouveau champ"
			use:tip={{ content: 'Nouveau champ' }}
		>
			<PlusIcon size={20} />
		</a>
	{/snippet}
</InputSelect>
