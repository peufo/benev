<script lang="ts">
	import Cropper from 'svelte-easy-crop'
	import { User } from '@prisma/client'
	import { mdiReload, mdiTrashCanOutline, mdiTrayArrowUp } from '@mdi/js'

	import { Dialog, DropDown, Icon } from '$lib/material'
	import { useForm } from '$lib/form'
	import { enhance } from '$app/forms'

	export let user: User

	let dialog: HTMLDialogElement
	let files: FileList
	let image = ''
	let crop = { x: 0, y: 0 }
	let zoom = 1

	function onFileSelected() {
		const file = files[0]
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
		successCallback: (action) => {
			console.log(action.search)
			return successMessages[action.search] || 'Succès'
		},
	})
</script>

<DropDown tippyProps={{ arrow: true }} hideOnBlur>
	<button
		slot="activator"
		type="button"
		class="border rounded-lg hover:shadow-lg transition-shadow"
	>
		<img src={user.avatarPlaceholder} alt="Avatar de l'utilisateur" class="h-28 w-28" />
	</button>

	<form action="/me/profile" method="post" enctype="multipart/form-data" use:enhance={form.submit}>
		<div class="flex flex-col">
			<div class="relative menu-item">
				<Icon path={mdiTrayArrowUp} class="opacity-70" size={20} />
				<span>Charger une photo</span>
				<input
					type="file"
					name="avatar"
					accept="image/*"
					bind:files
					on:change={onFileSelected}
					class="absolute inset-0 opacity-0 cursor-pointer"
				/>
			</div>

			<button type="button" class="menu-item">
				<Icon path={mdiTrashCanOutline} class="opacity-70" size={20} />
				<span>Supprimer cette photo</span>
			</button>

			<button formaction="/me/profile?/generate_avatar" class="menu-item">
				<Icon path={mdiReload} class="opacity-70" size={20} />
				<span>Générer un autre avatar</span>
			</button>
		</div>
	</form>
</DropDown>

<Dialog bind:dialog>
	<h2 slot="header" class="card-title">Photo de profil</h2>

	<div class="relative aspect-square rounded-lg overflow-hidden">
		<Cropper {image} aspect={1} bind:crop bind:zoom showGrid={false} zoomSpeed={0.2} />
	</div>
	<div class="flex justify-end mt-2">
		<button type="button" class="btn btn-primary"> Valider </button>
	</div>
</Dialog>
