<script lang="ts">
	import { mdiOpenInNew } from '@mdi/js'
	import { Period, Subscribe } from '@prisma/client'
	import { tick } from 'svelte'
	import type { Props as TippyProps } from 'tippy.js'
	import { formatRangeShort } from '$lib/formatRange'
	import { ContextMenu, Icon } from '$lib/material'
	import { eventPath } from '$lib/store'
	import PeriodSubscribes from '$lib/PeriodSubscribes.svelte'
	import InviteSubscribeForm from '$lib/InviteSubscribeForm.svelte'
	import PeriodDuplicate from './PeriodDuplicate.svelte'
	import ContextMenuToggle from './ContextMenuToggle.svelte'
	import PeriodForm from '$lib/PeriodForm.svelte'

	export let appendTo: TippyProps['appendTo'] = 'parent'

	type Period_Subscribes = Period & { subscribes: Subscribe[] }

	let contextMenu: ContextMenu
	let periodForm: PeriodForm
	let period: Period_Subscribes | undefined = undefined
	let mode: 'subscribes' | 'edit'

	export function show(event: MouseEvent, _period?: Period_Subscribes) {
		period = _period
		contextMenu.show(event)
		tick().then(() => periodForm?.setPeriod(period))
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

<ContextMenu
	class="min-w-[360px] max-h-none"
	bind:this={contextMenu}
	tippyProps={{ appendTo, interactiveDebounce: 500, trigger: 'mouseenter mouseleave' }}
>
	{#if period}
		<div class="flex flex-col gap-2">
			<div class="flex gap-1 items-center">
				<h3 class="font-medium ml-2">{formatRangeShort(period)}</h3>

				<div class="grow" />

				<PeriodDuplicate {period} on:success={() => contextMenu.hide()} />

				<ContextMenuToggle bind:mode />

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

			{#if mode === 'subscribes'}
				<div class="p-2">
					<PeriodSubscribes subscribes={period.subscribes} on:success={() => contextMenu.hide()} />

					{#if !isComplet}
						<InviteSubscribeForm periodId={period.id} on:success={() => contextMenu.hide()} />
					{/if}
				</div>
			{:else}
				<PeriodForm bind:this={periodForm} {period} on:success={() => contextMenu.hide()} />
			{/if}
		</div>
	{/if}
</ContextMenu>
