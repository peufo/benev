<script lang="ts">
	import type { User } from '@prisma/client'
	import { mdiReload, mdiTrashCanOutline } from '@mdi/js'
	import { page } from '$app/state'
	import { Icon, InputImage } from '$lib/fuma-legacy'
	import { toast } from 'svelte-sonner'
	import Avatar from './Avatar.svelte'
	import { deleteAvatar, generateAvatar, uploadAvatar } from './user.remote'

	interface Props {
		user: User
		class?: string
		/** Remplacent les évènements de la version Svelte 4. */
		onsuccess?: () => void
	}

	let { user, class: klass = '', onsuccess }: Props = $props()

	// Un même `<form>` porte trois remote functions: SvelteKit choisit celle dont l'`action`
	// correspond au `formaction` du bouton pressé, les autres attachements s'abstiennent.
	function notify(message: string) {
		return async ({ submit }: { submit: () => Promise<unknown> }) => {
			await submit()
			toast.success(message)
			onsuccess?.()
		}
	}
</script>

<form
	{...uploadAvatar.enhance(notify('Nouvel photo de profil enregistré'))}
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
			class="h-28 w-28 {klass}"
		/>

		{#snippet actions()}
			{#if user.avatarId}
				<button formaction={deleteAvatar.action} class="menu-item">
					<Icon path={mdiTrashCanOutline} class="opacity-70" size={20} />
					<span>Supprimer cette photo</span>
				</button>
			{:else}
				<button formaction={generateAvatar.action} class="menu-item">
					<Icon path={mdiReload} class="opacity-70" size={20} />
					<span>Générer un autre avatar</span>
				</button>
			{/if}
		{/snippet}
	</InputImage>
	{#if page.data.member?.userProfileRequiredFields.includes('avatarId')}
		<span class="text-xs text-warning">Photo de profil requise</span>
	{/if}
</form>
