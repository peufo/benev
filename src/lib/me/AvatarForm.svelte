<script lang="ts">
	import Cropper from 'svelte-easy-crop'
	import { User } from '@prisma/client'
	import type { Instance as TippyInstance } from 'tippy.js'
	import { mdiReload, mdiTrashCanOutline, mdiTrayArrowUp } from '@mdi/js'

	import { Dialog, DropDown, Icon } from '$lib/material'
	import { useForm } from '$lib/form'
	import { enhance } from '$app/forms'
	import Avatar from './Avatar.svelte'

	export let user: User

	let dialog: HTMLDialogElement
	let tip: TippyInstance
	let image = ''
	let crop: { width: number; height: number; x: number; y: number } | undefined = undefined
	let inputFile: HTMLInputElement

	function onFileSelected() {
		if (!inputFile.files) return
		const file = inputFile.files[0]
		const reader = new FileReader()
		reader.onload = ({ target }) => {
			image = (target?.result || '') as string
			dialog.showModal()
		}
		reader.readAsDataURL(file)
	}

	const successMessages: Record<string, string> = {
		'?/generate_avatar': 'Nouvel avatar généré',
		'?/upload_avatar': 'Nouvel photo de profil enregistré',
	}
	const form = useForm({
		successMessage: (action) => {
			tip.hide()
			return successMessages[action.search] || 'Succès'
		},
		successCallback: () => {
			if (dialog.open) dialog.close()
		},
	})
</script>

<form method="post" use:enhance={form.submit} enctype="multipart/form-data" class="contents">
	<DropDown tippyProps={{ arrow: true }} hideOnBlur bind:tip>
		<button
			slot="activator"
			type="button"
			class="border rounded-lg hover:shadow-lg transition-shadow overflow-hidden block"
		>
			<Avatar {user} class="h-28 w-28" />
		</button>

		<div class="flex flex-col">
			<button type="button" class="relative menu-item" on:click={() => inputFile.click()}>
				<Icon path={mdiTrayArrowUp} class="opacity-70" size={20} />
				<span>Charger une photo</span>
			</button>
			{#if user.avatarId}
				<button formaction="/me/profile?/remove_avatar" class="menu-item">
					<Icon path={mdiTrashCanOutline} class="opacity-70" size={20} />
					<span>Supprimer cette photo</span>
				</button>
			{:else}
				<button formaction="/me/profile?/generate_avatar" class="menu-item">
					<Icon path={mdiReload} class="opacity-70" size={20} />
					<span>Générer un autre avatar</span>
				</button>
			{/if}
		</div>
	</DropDown>

	<Dialog bind:dialog>
		<h2 slot="header" class="card-title">Photo de profil</h2>

		<div class="relative aspect-square rounded-lg overflow-hidden">
			<Cropper
				{image}
				aspect={1}
				showGrid={false}
				zoomSpeed={0.2}
				on:cropcomplete={(e) => (crop = e.detail.pixels)}
			/>
		</div>
		<div class="flex justify-end mt-2">
			<input type="hidden" name="json_crop" value={JSON.stringify(crop)} />
			<input
				class="hidden"
				type="file"
				name="image"
				accept="image/jpeg, image/png, image/webp, image/gif, image/avif, image/tiff"
				bind:this={inputFile}
				on:change={onFileSelected}
			/>

			<button formaction="/me/profile?/upload_avatar" class="btn btn-primary"> Valider </button>
		</div>
	</Dialog>
</form>
