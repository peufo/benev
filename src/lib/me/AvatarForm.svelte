<script lang="ts">
	import { RefreshCwIcon, Trash2Icon } from '@lucide/svelte'
	import type { User } from '@prisma/client'
	import { page } from '$app/state'
	import { InputImage } from '$lib/ui'
	import { enhanceForm } from '$lib/enhanceForm'
	import Avatar from './Avatar.svelte'
	import { deleteAvatar, generateAvatar, uploadAvatar } from './user.remote'

	interface Props {
		user: User
		class?: string
		/** Remplacent les évènements de la version Svelte 4. */
		onsuccess?: () => void
	}

	// La taille par défaut vit dans la valeur du prop: la fusionner à une taille
	// passée par le parent créerait un conflit d'utilitaires (h-28 vs h-20).
	let { user, class: klass = 'h-28 w-28', onsuccess }: Props = $props()

	// Un même `<form>` porte trois remote functions: SvelteKit choisit celle dont l'`action`
	// correspond au `formaction` du bouton pressé, les autres attachements s'abstiennent.
	const notify = (success: string) => enhanceForm({ success, onsuccess: () => onsuccess?.() })
</script>

<form
	{...uploadAvatar.enhance(notify('Nouvelle photo de profil enregistrée'))}
	{...deleteAvatar.enhance(notify('Photo supprimée'))}
	{...generateAvatar.enhance(notify('Nouvel avatar généré'))}
	enctype="multipart/form-data"
	class="contents"
>
	<InputImage formaction={uploadAvatar.action} title="Photo de profil">
		<Avatar
			firstName={user.firstName}
			avatarId={user.avatarId}
			avatarPlaceholder={user.avatarPlaceholder}
			class={klass}
		/>

		{#snippet actions({ hide })}
			{#if user.avatarId}
				<button formaction={deleteAvatar.action} class="menu-item" onclick={hide}>
					<Trash2Icon class="opacity-70" size={20} />
					<span>Supprimer cette photo</span>
				</button>
			{:else}
				<button formaction={generateAvatar.action} class="menu-item" onclick={hide}>
					<RefreshCwIcon class="opacity-70" size={20} />
					<span>Générer un autre avatar</span>
				</button>
			{/if}
		{/snippet}
	</InputImage>
	{#if page.data.member?.userProfileRequiredFields.includes('avatarId')}
		<span class="text-xs text-warning">Photo de profil requise</span>
	{/if}
</form>
