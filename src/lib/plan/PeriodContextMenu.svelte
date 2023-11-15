<script lang="ts">
	import { mdiOpenInNew } from '@mdi/js'
	import type { Period, Subscribe } from '@prisma/client'
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
	import { slide } from 'svelte/transition'

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

	let inviteDropdownIsOpen = false
</script>

<ContextMenu
	class="max-h-none {inviteDropdownIsOpen ? 'overflow-hidden' : ''}"
	bind:this={contextMenu}
	tippyProps={{ appendTo, interactiveDebounce: 500, trigger: 'mouseenter mouseleave' }}
>
	<div slot="header" class="flex gap-1 items-center">
		{#if period}
			<h3 class="font-medium ml-2">{formatRangeShort(period)}</h3>

			<div class="grow" />

			<ContextMenuToggle bind:mode />

			<PeriodDuplicate {period} on:success={() => contextMenu.hide()} />

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
					tippyProps={{ appendTo: 'parent' }}
				/>
			</a>
		{/if}
	</div>

	{#if period}
		{#if mode === 'subscribes'}
			<div class="p-2 flex flex-col gap-2">
				<PeriodSubscribes subscribes={period.subscribes} on:success={() => contextMenu.hide()} />

				{#if !isComplet}
					<InviteSubscribeForm
						periodId={period.id}
						on:success={() => contextMenu.hide()}
						on:input={() => {
							setTimeout(() => (inviteDropdownIsOpen = false), 100)
						}}
						tippyProps={{
							placement: 'bottom-start',
							popperOptions: {
								modifiers: [{ name: 'flip', enabled: false }],
							},
							onTrigger: () => {
								inviteDropdownIsOpen = true
							},
							onHidden: () => {
								inviteDropdownIsOpen = false
							},
						}}
					/>
					{#if inviteDropdownIsOpen}
						<div transition:slide={{ duration: 150 }} class="h-56" />
					{/if}
				{/if}
			</div>
		{:else}
			<PeriodForm
				bind:this={periodForm}
				{period}
				on:success={() => contextMenu.hide()}
				disableRedirect
			/>
		{/if}
	{/if}
</ContextMenu>
