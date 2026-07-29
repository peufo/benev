<script lang="ts">
	import { invalidateAll } from '$app/navigation'
	import { mdiTrashCanOutline } from '@mdi/js'
	import { Icon } from '$lib/fuma-legacy'
	import { toast } from 'svelte-sonner'
	import { deleteEventLogo, deleteEventPoster } from './event.remote'

	interface Props {
		kind: 'poster' | 'logo'
		eventId: string
	}

	let { kind, eventId }: Props = $props()

	let isLoading = $state(false)

	async function onclick() {
		if (isLoading) return
		isLoading = true
		const remove = kind === 'poster' ? deleteEventPoster : deleteEventLogo
		try {
			await remove({ id: eventId })
			toast.success('Image supprimée')
			await invalidateAll()
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Suppression impossible')
		} finally {
			isLoading = false
		}
	}
</script>

<button
	type="button"
	disabled={isLoading}
	class:opacity-50={isLoading}
	{onclick}
	class="link link-hover text-xs flex gap-1 items-center"
>
	<Icon path={mdiTrashCanOutline} size={14} />
	<span>Supprimer</span>
</button>
