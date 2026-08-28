<script lang="ts">
	import { UserPlusIcon } from '@lucide/svelte'
	import type { Member } from '@prisma/client'
	import type { RemoteFormField } from '@sveltejs/kit'
	import { InputMultiSelect, tip } from 'fuma'
	import { searchMembers } from '$lib/member/member.remote'
	import { inviteCall } from '$lib/drawerCall.svelte'
	import MemberLink from './MemberLink.svelte'

	interface Props {
		/** Le formulaire vit chez le parent: c'est lui qui passe le champ à alimenter. */
		field: RemoteFormField<string[]>
		value?: Member[]
	}

	let { field, value }: Props = $props()

	// Dérivé assignable, et non une liaison remontant vers `team.leaders`: `TeamForm` porte
	// `team` en objet nu, donc y écrire une propriété ne redéclencherait aucun rendu. Le
	// dérivé se ré-amorce quand le parent réassigne `team`.
	//
	// Lié, et non passé en simple prop: le multi-select écrit lui-même `value` à chaque choix,
	// et un `$bindable` cesse alors de suivre le parent — le responsable rendu par le tiroir
	// d'invitation n'apparaîtrait plus dès qu'une sélection l'a précédé.
	let leaders = $derived(value ?? [])
</script>

<InputMultiSelect {field} label="Responsables" bind:value={leaders} items={searchMembers}>
	{#snippet selected(member)}
		<MemberLink id={member.id} firstName={member.firstName} lastName={member.lastName} />
	{/snippet}
	{#snippet proposal(member)}
		<span>{member.firstName} {member.lastName}</span>
	{/snippet}
	{#snippet append({ hide })}
		<a
			{...inviteCall.link(
				{ from: 'team', oncreated: (member) => (leaders = [...leaders, member]) },
				{ onclick: hide }
			)}
			class="btn btn-square btn-soft btn-sm"
			use:tip={{ content: 'Inviter un nouveau membre' }}
		>
			<UserPlusIcon size={20} />
		</a>
	{/snippet}
</InputMultiSelect>
