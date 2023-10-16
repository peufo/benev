<script lang="ts">
	import PeriodForm from '$lib/PeriodForm.svelte'
	import { formatRangeShort } from '$lib/formatRange'
	import { ContextMenu, Dialog, Icon } from '$lib/material'
	import { eventPath } from '$lib/store'
	import { mdiOpenInNew, mdiPencilOutline } from '@mdi/js'
	import { Period } from '@prisma/client'
	import { tick } from 'svelte'

	let contextMenu: ContextMenu
	let period: Period | null = null
	let periodForm: PeriodForm

	let editIsActive = false
	let editDialog: HTMLDialogElement

	export function open(event: MouseEvent, _period: Period) {
		period = _period
		contextMenu.open(event)
	}

	export function close() {
		period = null
		editIsActive = false
		contextMenu.close()
	}

	async function handleClickEdit() {
		if (!period) return
		editIsActive = true
		await tick()
		periodForm.setPeriod(period)
		editDialog.showModal()
	}
</script>

<ContextMenu bind:this={contextMenu} on:close={() => !editDialog?.open && (editIsActive = false)}>
	{#if period}
		<div class="max-w-[320px] flex flex-col gap-2">
			<div class="flex gap-2 items-center">
				<h3 class="font-medium text-sm">{formatRangeShort(period)}</h3>

				<div class="grow" />

				<button class="btn btn-sm btn-square ml-4" on:click={handleClickEdit}>
					<Icon path={mdiPencilOutline} size={20} class="opacity-60" title="Éditer la période" />
				</button>
				<a
					href="{$eventPath}/teams/{period.teamId}/{period.id}"
					class="btn btn-sm btn-square"
					target="_blank"
				>
					<Icon
						path={mdiOpenInNew}
						size={20}
						class="opacity-60"
						title="Ouvrir dans un autre onglet"
					/>
				</a>
			</div>
		</div>
	{/if}
</ContextMenu>

{#if period && editIsActive}
	<Dialog bind:dialog={editDialog} title="Modification de la periode">
		<PeriodForm
			bind:this={periodForm}
			on:success={() => {
				editDialog.close()
				editIsActive = false
			}}
		/>
	</Dialog>
{/if}
