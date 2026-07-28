<script lang="ts">
	import type { User } from '@prisma/client'
	import { createEventDispatcher } from 'svelte'
	import { mdiReload, mdiTrashCanOutline } from '@mdi/js'
	import { page } from '$app/stores'
	import { Icon } from '$lib/fuma'
	import { useForm } from '$lib/fuma'
	import { enhance } from '$app/forms'
	import Avatar from './Avatar.svelte'
	import { InputImage } from '$lib/fuma'

	interface Props {
		user: User
		class?: string
	}

	let { user, class: klass = '' }: Props = $props()

	const dispatch = createEventDispatcher<{ success: void }>()

	const successMessages: Record<string, string> = {
		'?/generate_avatar': 'Nouvel avatar généré',
		'?/upload_avatar': 'Nouvel photo de profil enregistré',
	}
	const form = useForm({
		onSuccess() {
			dispatch('success')
		},
		successMessage(action) {
			return successMessages[action.search] || 'Succès'
		},
	})
</script>

<form method="post" use:enhance={form.submit} enctype="multipart/form-data" class="contents">
	<InputImage formaction="/me?/upload_avatar" title="Photo de profil">
		<Avatar
			firstName={user.firstName}
			avatarId={user.avatarId}
			avatarPlaceholder={user.avatarPlaceholder}
			class="h-28 w-28 {klass}"
		/>

		{#snippet actions()}
			{#if user.avatarId}
				<button formaction="/me?/delete_avatar" class="menu-item">
					<Icon path={mdiTrashCanOutline} class="opacity-70" size={20} />
					<span>Supprimer cette photo</span>
				</button>
			{:else}
				<button formaction="/me?/generate_avatar" class="menu-item">
					<Icon path={mdiReload} class="opacity-70" size={20} />
					<span>Générer un autre avatar</span>
				</button>
			{/if}
		{/snippet}
	</InputImage>
	{#if $page.data.member?.userProfileRequiredFields.includes('avatarId')}
		<span class="text-xs text-warning">Photo de profil requise</span>
	{/if}
</form>
