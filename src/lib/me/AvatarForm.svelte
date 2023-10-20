<script lang="ts">
	import Cropper from 'svelte-easy-crop'
	import { Dialog, DropDown, Icon } from '$lib/material'
	import { mdiReload, mdiTrashCanOutline, mdiTrayArrowUp } from '@mdi/js'

	export let avatar = avatarGeneration()

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

	function avatarGeneration(): string {
		const url = new URL('https://api.dicebear.com/7.x/avataaars/svg')
		url.searchParams.append('seed', String(Math.random()))
		return url.toString()
	}
</script>

<DropDown tippyProps={{ arrow: true }} hideOnBlur>
	<button
		slot="activator"
		type="button"
		class="border rounded-lg hover:shadow-lg transition-shadow"
	>
		<img src={avatar} alt="Avatar de l'utilisateur" class="h-28 w-28" />
	</button>

	<form action="" method="post" enctype="multipart/form-data">
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

			<button type="button" class="menu-item" on:click={() => (avatar = avatarGeneration())}>
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
