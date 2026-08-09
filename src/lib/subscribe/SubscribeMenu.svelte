<script lang="ts">
	import { CircleCheckIcon, EllipsisIcon, Trash2Icon, TriangleAlertIcon } from '@lucide/svelte'
	import { Popover } from 'fuma'
	import type { Subscribe } from '@prisma/client'
	import { enhanceForm } from '$lib/enhanceForm'
	import { deleteSubscribe, toggleSubscribeIsAbsent } from './subscribeState.remote'

	interface Props {
		subscribe: Subscribe
	}

	let { subscribe }: Props = $props()

	const uid = $props.id()
	const toggleIsAbsentForm = toggleSubscribeIsAbsent.for(uid)
	const deleteForm = deleteSubscribe.for(uid)
</script>

<Popover placement="bottom-end" listenFocus={false} class="p-1">
	{#snippet trigger({ trigger })}
		<button type="button" class="relative z-10 btn btn-sm btn-square" {...trigger}>
			<EllipsisIcon size={20} class="opacity-70" />
		</button>
	{/snippet}

	{#snippet children({ hide })}
		<div class="flex flex-col w-max">
			<form
				{...toggleIsAbsentForm.enhance(
					enhanceForm({ success: 'Présence mise à jour', onsuccess: hide })
				)}
			>
				<input type="hidden" name="subscribeId" value={subscribe.id} />
				<button class="menu-item w-full">
					{#if subscribe.isAbsent}
						<CircleCheckIcon class="text-success" size={20} />
						<span>Marquer comme présent</span>
					{:else}
						<TriangleAlertIcon class="text-warning" size={20} />
						<span>Marquer comme absent</span>
					{/if}
				</button>
			</form>

			<form
				{...deleteForm.enhance(
					enhanceForm({
						before: () => confirm('Supprimer définitivement cette inscription ?'),
						success: 'Inscription supprimée',
						onsuccess: hide,
					})
				)}
			>
				<input type="hidden" name="subscribeId" value={subscribe.id} />
				<button class="menu-item w-full">
					<Trash2Icon class="text-error/80" size={20} />
					<span>Supprimer</span>
				</button>
			</form>
		</div>
	{/snippet}
</Popover>
