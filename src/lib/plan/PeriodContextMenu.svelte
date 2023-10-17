<script lang="ts">
	import { mdiOpenInNew } from '@mdi/js'
	import { Period, Subscribe } from '@prisma/client'
	import { formatRangeShort } from '$lib/formatRange'
	import { ContextMenu, Icon } from '$lib/material'
	import { eventPath } from '$lib/store'
	import PeriodForm from '$lib/PeriodForm.svelte'
	import PeriodSubscribes from '$lib/PeriodSubscribes.svelte'
	import InviteSubscribeForm from '$lib/InviteSubscribeForm.svelte'
	import PeriodDuplicate from './PeriodDuplicate.svelte'
	import PeriodEditMenu from '$lib/PeriodEditMenu.svelte'

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

				<PeriodEditMenu {period} />

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
