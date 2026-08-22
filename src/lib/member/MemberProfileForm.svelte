<script lang="ts">
	import MemberField from './MemberField.svelte'
	import type { MemberProfile } from '$lib/server'
	import { enhanceForm } from '$lib/enhanceForm'
	import { SaveBar } from '$lib/ui'
	import { updateMemberProfile } from './member.remote'

	interface Props {
		class?: string
		memberProfile: MemberProfile
		/** Champs à choix en listes déroulantes: le profil tient alors dans une page. */
		compact?: boolean
		/**
		 * Barre flottante à la première retouche, au lieu du bouton de validation. Le profil
		 * s'édite alors là où il s'affiche, sans étape de bascule.
		 */
		saveBar?: boolean
		onsuccess?: () => void
	}

	let {
		class: klass = '',
		memberProfile,
		compact = false,
		saveBar = false,
		onsuccess,
	}: Props = $props()

	const formId = $props.id()
	const remoteForm = $derived(updateMemberProfile.for(memberProfile.id))

	let formElement = $state<HTMLFormElement>()
	let bar = $state<ReturnType<typeof SaveBar>>()
	// Remonte les listes déroulantes, dont la sélection vit dans le composant: le `reset()`
	// natif ne restaure que les `defaultValue` du DOM.
	let resetToken = $state(0)
</script>

<form
	{...remoteForm.enhance(
		enhanceForm({
			success: 'Profil enregistré',
			onsuccess: () => {
				bar?.rebase()
				onsuccess?.()
			},
		})
	)}
	id={formId}
	bind:this={formElement}
	class={['@container', 'grid grid-cols-2 gap-x-4 gap-y-3', klass]}
>
	<input type="hidden" name="memberId" value={memberProfile.id} />

	{#key resetToken}
		{#each memberProfile.event.memberFields as field (field.id)}
			{@const value = memberProfile.profileJson[field.id] || ''}
			<MemberField {field} {value} {compact} />
		{/each}
	{/key}

	{#if !saveBar}
		<div
			class={[
				'sticky bottom-0 col-span-full mt-2 gap-2 py-4 ',
				'flex flex-row-reverse backdrop-blur-sm',
				'border-t border-soft',
			]}
		>
			<button class="btn btn-primary">Valider</button>
		</div>
	{/if}
</form>

{#if saveBar}
	<SaveBar
		bind:this={bar}
		form={formElement}
		{formId}
		key={memberProfile.id}
		pending={remoteForm.pending > 0}
		onreset={() => resetToken++}
	/>
{/if}
