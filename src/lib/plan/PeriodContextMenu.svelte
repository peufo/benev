<script lang="ts">
	import { mdiOpenInNew } from '@mdi/js'
	import { Period, Subscribe } from '@prisma/client'
	import { formatRangeShort } from '$lib/formatRange'
	import { ContextMenu, Icon } from '$lib/material'
	import { eventPath } from '$lib/store'
	import PeriodSubscribes from '$lib/PeriodSubscribes.svelte'
	import InviteSubscribeForm from '$lib/InviteSubscribeForm.svelte'
	import PeriodDuplicate from './PeriodDuplicate.svelte'
	import PeriodEditMenu from '$lib/PeriodEditMenu.svelte'
	import { tick } from 'svelte'

	type Period_Subscribes = Period & { subscribes: Subscribe[] }

	let contextMenu: ContextMenu
	let periodEditMenu: PeriodEditMenu
	let period: Period_Subscribes | undefined = undefined

	export function show(event: MouseEvent, _period?: Period_Subscribes) {
		period = _period
		contextMenu.show(event)
		tick().then(() => periodEditMenu.setPeriod(period))
	}

	export function hide() {
		period = undefined
		contextMenu.hide()
	}

	$: isComplet =
		period &&
		period.subscribes.filter(({ state }) => state === 'request' || state === 'accepted').length >=
			period.maxSubscribe
</script>

<ContextMenu bind:this={contextMenu}>
	{#if period}
		<div class="flex flex-col gap-2">
			<div class="flex gap-1 items-center">
				<h3 class="font-medium ml-2">{formatRangeShort(period)}</h3>

				<div class="grow" />

				<PeriodDuplicate {period} on:success={() => contextMenu.hide()} />

				<PeriodEditMenu bind:this={periodEditMenu} on:success={() => contextMenu.hide()} />

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

			<PeriodSubscribes subscribes={period.subscribes} on:success={() => contextMenu.hide()} />
			{#if !isComplet}
				<InviteSubscribeForm periodId={period.id} on:success={() => contextMenu.hide()} />
			{/if}
		</div>
	{/if}
</ContextMenu>
