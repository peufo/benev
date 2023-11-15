<script lang="ts">
	import { User } from '@prisma/client'
	import type { Instance as TippyInstance } from 'tippy.js'
	import { mdiReload, mdiTrashCanOutline } from '@mdi/js'

	import { Icon } from '$lib/material'
	import { useForm } from '$lib/form'
	import { enhance } from '$app/forms'
	import Avatar from './Avatar.svelte'
	import { InputImage } from '$lib/material/input'

	export let user: User
	let klass = ''
	export { klass as class }

	const successMessages: Record<string, string> = {
		'?/generate_avatar': 'Nouvel avatar généré',
		'?/upload_avatar': 'Nouvel photo de profil enregistré',
	}
	const form = useForm({
		successMessage: (action) => {
			return successMessages[action.search] || 'Succès'
		},
	})
</script>

<form method="post" use:enhance={form.submit} enctype="multipart/form-data" class="contents">
	<InputImage formaction="/me?/upload_avatar">
		<Avatar {user} class="h-28 w-28 {klass}" />

		<svelte:fragment slot="actions">
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
		</svelte:fragment>
	</InputImage>
</form>
