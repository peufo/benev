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
		denied: { label: 'Refuser', icon: mdiCloseOctagonOutline, class: 'fill-error' },
		cancelled: { label: 'Annuler', icon: mdiTrashCanOutline, class: 'fill-error' },
	}
</script>

<script lang="ts">
	import type { Subscribe } from '@prisma/client'
	import SubscribeState from '$lib/SubscribeState.svelte'
	import { useForm } from '$lib/form'
	import { enhance } from '$app/forms'
	import { Icon } from '$lib/material'
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

	let isMember = subscribe.memberId === $page.data.member?.id

	const form = useForm({ successMessage: 'Status changé', successReset: false })
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
	<button class="btn-square btn-sm">
		<SubscribeState {subscribe} />
	</button>
{:else}
	<form method="post" use:enhance={form.submit} class="h-8">
		<div class="dropdown dropdown-end">
			<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
			<label tabindex="0" class="btn btn-square btn-sm" on:click|stopPropagation>
				<SubscribeState {subscribe} />
			</label>
			<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
			<ul tabindex="0" class="menu shadow dropdown-content z-10 bg-base-200 rounded-box">
				{#each editions as [state, edit]}
					<li>
						<button formaction="{action}?/subscribe_{state}" on:click|stopPropagation>
							<Icon path={edit.icon} class={edit.class} />
							{edit.label}
						</button>
					</li>
				{/each}
			</ul>
		</div>
	</form>
{/if}
