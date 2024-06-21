<script lang="ts">
	import { invalidateAll } from '$app/navigation'
	import { mdiTrashCanOutline } from '@mdi/js'
	import axios from 'axios'
	import { Icon } from 'fuma'
	import { toast } from 'svelte-sonner'

	export let formaction: string
	export let eventId: string

	let isLoading = false

	function onclick() {
		if (isLoading) return
		isLoading = true
		const formDate = new FormData()
		formDate.set('id', eventId)
		axios
			.postForm(formaction, formDate)
			.catch((err) => typeof err === 'object' && 'message' in err && toast.error(err.message))
			.then(() => {
				toast.success('Image supprimée')
				invalidateAll()
			})
			.finally(() => (isLoading = false))
	}
</script>

<button
	type="button"
	disabled={isLoading}
	class:opacity-50={isLoading}
	on:click={onclick}
	class="link link-hover text-xs flex gap-1 items-center"
>
	<Icon path={mdiTrashCanOutline} size={14} />
	<span>Supprimer</span>
</button>
