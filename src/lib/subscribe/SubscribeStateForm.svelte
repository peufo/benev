<script lang="ts" module>
	import type { SubscribeState as ISubscribeState } from '@prisma/client'

	type Edtitions = Record<ISubscribeState, ISubscribeState[]>
	const creatorEditions: Edtitions = {
		request: ['cancelled'],
		accepted: ['cancelled'],
		denied: ['cancelled'],
		cancelled: ['request'],
	}
	const subscriberEditions: Edtitions = {
		request: ['accepted', 'denied'],
		accepted: ['denied'],
		denied: ['accepted'],
		cancelled: [],
	}
	type States = Record<ISubscribeState, { icon: string; class: string; label: string }>
	const states: States = {
		request: { label: 'Rétablir', icon: mdiAlertOctagonOutline, class: 'fill-warning' },
		accepted: { label: 'Confirmer', icon: mdiCheck, class: 'fill-success' },
		denied: { label: 'Décliner', icon: mdiCloseOctagonOutline, class: 'fill-error' },
		cancelled: { label: 'Annuler', icon: mdiTrashCanOutline, class: 'fill-error' },
	}
</script>

<script lang="ts">
	import { run, createBubbler, stopPropagation } from 'svelte/legacy'

	const bubble = createBubbler()
	import type { Props as TippyProps } from 'tippy.js'
	import type { Subscribe } from '@prisma/client'
	import { SubscribeState } from '$lib/subscribe'
	import { useForm } from '$lib/fuma-legacy/validation'
	import { enhance } from '$app/forms'
	import { Icon } from '$lib/fuma-legacy'
	import { DropDown } from 'fuma'
	import {
		mdiCloseOctagonOutline,
		mdiCheck,
		mdiTrashCanOutline,
		mdiAlertOctagonOutline,
	} from '@mdi/js'
	import { page } from '$app/stores'

	interface Props {
		subscribe: Subscribe & { member: { isValidedByUser: boolean } }
		eventId?: string
		action?: string
		isLeader?: boolean
		tippyProps?: Partial<TippyProps>
		canBeLarge?: boolean
		/** Remplacent les évènements de la version Svelte 4. */
		onsuccess?: () => void
	}

	let {
		subscribe,
		eventId = $page.params.eventId,
		action = `/${eventId}/subscribes/${subscribe.id}`,
		isLeader = false,
		tippyProps = {},
		canBeLarge = false,
		onsuccess,
	}: Props = $props()

	let isSelf = subscribe.memberId === $page.data.member?.id

	const form = useForm({
		successMessage: 'Status changé',
		successReset: false,
		onSuccess: () => onsuccess?.(),
	})
	let creatorStates: Partial<States> = $state({})
	let subscriberStates: Partial<States> = $state({})
	run(() => {
		creatorStates = creatorEditions[subscribe.state].reduce(
			(acc, cur) => ({ ...acc, [cur]: states[cur] }),
			{}
		)
	})
	run(() => {
		subscriberStates = subscriberEditions[subscribe.state].reduce(
			(acc, cur) => ({ ...acc, [cur]: states[cur] }),
			{}
		)
	})
	let isCreator = $derived(
		(isSelf && subscribe.createdBy === 'user') || (isLeader && subscribe.createdBy === 'leader')
	)
	let isSubscriber = $derived(
		(isSelf && subscribe.createdBy === 'leader') || (isLeader && subscribe.createdBy === 'user')
	)
	let isSelfCancelAllowed = $derived($page.data.event?.selfSubscribeCancelAllowed || isLeader)
	let isConfirmation = $derived(!isCreator && subscribe.state === 'request')
	let isConfirmationForced = $derived(isLeader && isCreator && subscribe.state === 'request')
	let editions = $derived(
		Object.entries({
			...(isCreator && creatorStates),
			...(isSubscriber && subscriberStates),
			...(isConfirmationForced && {
				accepted: {
					...states.accepted,
					label: 'Confirmer au nom du membre',
					class: 'fill-blue-500',
				},
			}),
		}).filter(
			([state]) =>
				state !== subscribe.state &&
				((state !== 'cancelled' && state !== 'denied') || isSelfCancelAllowed)
		)
	)
</script>

{#if !editions.length}
	<button class="btn btn-square btn-sm btn-ghost opacity-70 relative">
		<SubscribeState {subscribe} />
	</button>
{:else}
	<DropDown tippyProps={{ arrow: true, trigger: 'click', ...tippyProps }}>
		{#snippet activator()}
			<button
				class="relative btn btn-sm z-10 {!isConfirmation || !canBeLarge
					? 'btn-square'
					: 'max-sm:btn-square'}"
			>
				<SubscribeState {subscribe} />
				{#if isConfirmation}
					<div
						class="absolute w-3 h-3 bg-error -right-1.5 -top-1.5 rounded-full animate-ping"
					></div>
					<div class="absolute w-2 h-2 bg-error -right-1 -top-1 rounded-full"></div>
					{#if canBeLarge}
						<span class="font-medium hidden sm:inline">à confirmer</span>
					{/if}
				{/if}
			</button>
		{/snippet}

		<form method="post" use:enhance={form.submit} class="flex flex-col gap-1">
			{#each editions as [state, edit] (state)}
				<button
					class="menu-item"
					formaction="{action}?/subscribe_{state}"
					onclick={stopPropagation(bubble('click'))}
				>
					<Icon path={edit.icon} class={edit.class} />
					{edit.label}
				</button>
			{/each}
		</form>
	</DropDown>
{/if}
