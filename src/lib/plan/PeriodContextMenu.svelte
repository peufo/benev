<script lang="ts">
	import { tick } from 'svelte'
	import { mdiOpenInNew, mdiPencilOutline, mdiContentDuplicate } from '@mdi/js'
	import { Period, Subscribe } from '@prisma/client'
	import { invalidateAll } from '$app/navigation'
	import { formatRangeShort } from '$lib/formatRange'
	import { ContextMenu, Dialog, Icon } from '$lib/material'
	import { eventPath } from '$lib/store'
	import PeriodForm from '$lib/PeriodForm.svelte'
	import PeriodSubscribes from '$lib/PeriodSubscribes.svelte'
	import InviteSubscribeForm from '$lib/InviteSubscribeForm.svelte'
	import axios from 'axios'
	import PeriodDuplicate from './PeriodDuplicate.svelte'

	type Period_Subscribes = Period & { subscribes: Subscribe[] }

	let contextMenu: ContextMenu
	let period: Period_Subscribes | undefined = undefined
	let periodForm: PeriodForm

	let editIsActive = false
	let editDialog: HTMLDialogElement

	export function open(event: MouseEvent, _period: Period_Subscribes & {}) {
		period = _period
		contextMenu.open(event)
	}

	export function close() {
		period = undefined
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

	$: isComplet =
		period &&
		period.subscribes.filter(({ state }) => state === 'request' || state === 'accepted').length >=
			period.maxSubscribe
</script>

<ContextMenu bind:this={contextMenu} on:close={() => !editDialog?.open && (editIsActive = false)}>
	{#if period}
		<div class="flex flex-col gap-2">
			<div class="flex gap-1 items-center">
				<h3 class="font-medium ml-2">{formatRangeShort(period)}</h3>

				<div class="grow" />

				<PeriodDuplicate {period} on:success={() => contextMenu.close()} />
				<button class="btn btn-sm btn-square" on:click={handleClickEdit}>
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

			<PeriodSubscribes subscribes={period.subscribes} on:success={() => contextMenu.close()} />
			{#if !isComplet}
				<InviteSubscribeForm periodId={period.id} on:success={() => contextMenu.close()} />
			{/if}
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
