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
	import SubscribeState from '$lib/SubscribeState.svelte'
	import { useForm } from '$lib/form'
	import { enhance } from '$app/forms'
	import { Icon, DropDown } from '$lib/material'
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

	let isMember = subscribe.memberId === $page.data.member?.id
	const dispatch = createEventDispatcher<{ success: void }>()

	const form = useForm({
		successMessage: 'Status changé',
		successReset: false,
		successCallback: () => dispatch('success'),
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
		(isMember && subscribe.createdBy === 'user') || (isLeader && subscribe.createdBy === 'leader')
	$: isSubscriber =
		(isMember && subscribe.createdBy === 'leader') || (isLeader && subscribe.createdBy === 'user')
	$: editions = Object.entries({
		...(isCreator && creatorStates),
		...(isSubscriber && subscriberStates),
	}).filter(([state]) => state !== subscribe.state)
</script>

{#if !editions.length}
	<button class="btn-square btn-sm btn-ghost opacity-70">
		<SubscribeState {subscribe} />
	</button>
{:else}
	<DropDown tippyProps={{ arrow: true, trigger: 'click', ...tippyProps }}>
		<button
			slot="activator"
			class="relative btn btn-sm btn-square btn-ghost hover:bg-base-200 z-10"
		>
			<SubscribeState {subscribe} />
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
