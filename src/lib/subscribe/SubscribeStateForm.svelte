<script lang="ts" context="module">
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
	import { createEventDispatcher } from 'svelte'
	import type { Props as TippyProps } from 'tippy.js'
	import type { Subscribe } from '@prisma/client'
	import { SubscribeState } from '$lib/subscribe'
	import { useForm } from 'fuma/validation'
	import { enhance } from '$app/forms'
	import { Icon, DropDown } from 'fuma'
	import {
		mdiCloseOctagonOutline,
		mdiCheck,
		mdiTrashCanOutline,
		mdiAlertOctagonOutline,
	} from '@mdi/js'
	import { page } from '$app/stores'

	export let subscribe: Subscribe
	export let eventId = $page.params.eventId
	export let action = `/${eventId}/subscribes/${subscribe.id}`
	export let isLeader = false
	export let tippyProps: Partial<TippyProps> = {}
	export let canBeLarge = false

	let isSelf = subscribe.memberId === $page.data.member?.id
	const dispatch = createEventDispatcher<{ success: void }>()

	const form = useForm({
		successMessage: 'Status changé',
		successReset: false,
		onSuccess: () => dispatch('success'),
	})
	let creatorStates: Partial<States> = {}
	let subscriberStates: Partial<States> = {}
	$: creatorStates = creatorEditions[subscribe.state].reduce(
		(acc, cur) => ({ ...acc, [cur]: states[cur] }),
		{}
	)
	$: subscriberStates = subscriberEditions[subscribe.state].reduce(
		(acc, cur) => ({ ...acc, [cur]: states[cur] }),
		{}
	)
	$: isCreator =
		(isSelf && subscribe.createdBy === 'user') || (isLeader && subscribe.createdBy === 'leader')
	$: isSubscriber =
		(isSelf && subscribe.createdBy === 'leader') || (isLeader && subscribe.createdBy === 'user')
	$: isSelfCancelAllowed = $page.data.event?.selfSubscribeCancelAllowed || isLeader
	$: editions = Object.entries({
		...(isCreator && creatorStates),
		...(isSubscriber && subscriberStates),
	}).filter(
		([state]) =>
			state !== subscribe.state &&
			((state !== 'cancelled' && state !== 'denied') || isSelfCancelAllowed)
	)
	$: isConfirmation = !isCreator && subscribe.state === 'request'
</script>

{#if !editions.length}
	<button class="btn btn-square btn-sm btn-ghost opacity-70 relative">
		<SubscribeState {subscribe} />
	</button>
{:else}
	<DropDown tippyProps={{ arrow: true, trigger: 'click', ...tippyProps }}>
		<button
			slot="activator"
			class="relative btn btn-sm z-10 {!isConfirmation || !canBeLarge
				? 'btn-square'
				: 'max-sm:btn-square'}"
		>
			<SubscribeState {subscribe} />
			{#if isConfirmation}
				<div class="absolute w-3 h-3 bg-error -right-1.5 -top-1.5 rounded-full animate-ping" />
				<div class="absolute w-2 h-2 bg-error -right-1 -top-1 rounded-full" />
				{#if canBeLarge}
					<span class="font-medium hidden sm:inline">à confirmer</span>
				{/if}
			{/if}
		</button>

		<form method="post" use:enhance={form.submit} class="flex flex-col gap-1">
			{#each editions as [state, edit]}
				<button class="menu-item" formaction="{action}?/subscribe_{state}" on:click|stopPropagation>
					<Icon path={edit.icon} class={edit.class} />
					{edit.label}
				</button>
			{/each}
		</form>
	</DropDown>
{/if}
