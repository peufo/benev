<script lang="ts">
	import { UserPlusIcon } from '@lucide/svelte'
	import type { Member } from '@prisma/client'
	import type { RemoteFormField } from '@sveltejs/kit'
	import { InputMultiSelect, tip, urlParam } from 'fuma'
	import { searchMembers } from '$lib/member/member.remote'
	import MemberLink from './MemberLink.svelte'

	interface Props {
		/** Le formulaire vit chez le parent: c'est lui qui passe le champ à alimenter. */
		field: RemoteFormField<string[]>
		value?: Member[]
	}

	let { field, value }: Props = $props()

	// Dérivé assignable, et non une liaison remontant vers `team.leaders`: `TeamForm` porte
	// `team` en objet nu, donc y écrire une propriété ne redéclencherait aucun rendu. Le
	// dérivé se ré-amorce quand le parent réassigne `team` — c'est ainsi qu'un responsable
	// fraîchement invité apparaît ici.
	let leaders = $derived(value ?? [])
</script>

<InputMultiSelect
	{field}
	label="Responsables"
	value={leaders}
	onSelect={(selection) => (leaders = selection)}
	items={searchMembers}
>
	{#snippet selected(member)}
		<MemberLink id={member.id} firstName={member.firstName} lastName={member.lastName} />
	{/snippet}
	{#snippet proposal(member)}
		<span>{member.firstName} {member.lastName}</span>
	{/snippet}
	{#snippet append()}
		<a
			href={urlParam.with({ form_invite: '{}' })}
			class="btn btn-square btn-soft btn-sm"
			data-sveltekit-noscroll
			data-sveltekit-replacestate
			use:tip={{ content: 'Inviter un nouveau membre' }}
		>
			<UserPlusIcon size={20} />
		</a>
	{/snippet}
</InputMultiSelect>
