<script lang="ts">
	import { RefreshCwIcon, Trash2Icon } from '@lucide/svelte'
	import type { User } from '@prisma/client'
	import { page } from '$app/state'
	import { InputImage } from '#lib/ui/index.js'
	import { enhanceForm } from '#lib/enhanceForm.js'
	import Avatar from './Avatar.svelte'
	import { deleteAvatar, generateAvatar, uploadAvatar } from './user.remote'
	import type { ClassValue } from 'svelte/elements'

	interface Props {
		user: User
		class?: ClassValue
		classInput?: ClassValue
		onsuccess?: () => void
	}

	// La taille par défaut vit dans la valeur du prop: la fusionner à une taille
	// passée par le parent créerait un conflit d'utilitaires (h-28 vs h-20).
	let { user, class: klass = 'h-28 w-28', classInput, onsuccess }: Props = $props()

	const notify = (success: string) => enhanceForm({ success, onsuccess: () => onsuccess?.() })

	// Supprimer et régénérer n'ont aucun champ, mais SvelteKit refuse qu'un envoi porte ceux
	// d'une autre remote function: chacun a son `<form>`, vide, que ses boutons visent par `form`.
	const uid = $props.id()
	const deleteFormId = `${uid}-delete`
	const generateFormId = `${uid}-generate`
</script>

<form {...deleteAvatar.enhance(notify('Photo supprimée'))} id={deleteFormId} class="hidden"></form>
<form
	{...generateAvatar.enhance(notify('Nouvel avatar généré'))}
	id={generateFormId}
	class="hidden"
></form>

<form
	{...uploadAvatar.enhance(notify('Nouvelle photo de profil enregistrée'))}
	enctype="multipart/form-data"
	class="contents"
>
	<InputImage
		formaction={uploadAvatar.action}
		imageField={uploadAvatar.fields.image}
		cropField={uploadAvatar.fields.crop}
		title="Photo de profil"
		class={classInput}
	>
		<Avatar
			firstName={user.firstName}
			avatarId={user.avatarId}
			avatarPlaceholder={user.avatarPlaceholder}
			class={klass}
		/>

		{#snippet actions({ hide })}
			{#if user.avatarId}
				<button
					form={deleteFormId}
					formaction={deleteAvatar.action}
					class="menu-item"
					onclick={hide}
				>
					<Trash2Icon class="opacity-70" size={20} />
					<span>Supprimer cette photo</span>
				</button>
			{:else}
				<button
					form={generateFormId}
					formaction={generateAvatar.action}
					class="menu-item"
					onclick={hide}
				>
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
