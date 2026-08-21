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
	type States = typeof SUBSCRIBE_STATE_ACTION
</script>

<script lang="ts">
	import type { Subscribe } from '@prisma/client'
	import { Popover, tip } from 'fuma'
	import { enhanceForm } from '$lib/enhanceForm'
	import { page } from '$app/state'
	import { setSubscribeState } from './subscribeState.remote'
	import { SUBSCRIBE_STATE_ACTION } from '$lib/constant'
	import { getSubscribeState } from './subscribeState'

	interface Props {
		subscribe: Subscribe & { member: { isValidedByUser: boolean } }
		isLeader?: boolean
		canBeLarge?: boolean
		/** Remplacent les évènements de la version Svelte 4. */
		onsuccess?: () => void
	}

	let { subscribe, isLeader = false, canBeLarge = false, onsuccess }: Props = $props()

	let isSelf = $derived(subscribe.memberId === page.data.member?.id)
	let stateDisplay = $derived(getSubscribeState(subscribe))

	// Une clé par montage, pas par inscription: la même inscription peut être affichée deux fois
	// simultanément (ligne de période + tiroir de période, `/me` + tiroir…), et deux `<form>` ne
	// peuvent pas partager une même instance de remote form.
	const uid = $props.id()
	const remoteForm = setSubscribeState.for(uid)

	let creatorStates: Partial<States> = $derived(
		creatorEditions[subscribe.state].reduce(
			(acc, cur) => ({ ...acc, [cur]: SUBSCRIBE_STATE_ACTION[cur] }),
			{}
		)
	)
	let subscriberStates: Partial<States> = $derived(
		subscriberEditions[subscribe.state].reduce(
			(acc, cur) => ({ ...acc, [cur]: SUBSCRIBE_STATE_ACTION[cur] }),
			{}
		)
	)
	let isCreator = $derived(
		(isSelf && subscribe.createdBy === 'user') || (isLeader && subscribe.createdBy === 'leader')
	)
	let isSubscriber = $derived(
		(isSelf && subscribe.createdBy === 'leader') || (isLeader && subscribe.createdBy === 'user')
	)
	let isSelfCancelAllowed = $derived(page.data.event?.selfSubscribeCancelAllowed || isLeader)
	let isConfirmation = $derived(!isCreator && subscribe.state === 'request')
	let isConfirmationForced = $derived(isLeader && isCreator && subscribe.state === 'request')
	let editions = $derived(
		Object.entries({
			...(isCreator && creatorStates),
			...(isSubscriber && subscriberStates),
			...(isConfirmationForced && {
				accepted: {
					...SUBSCRIBE_STATE_ACTION.accepted,
					label: 'Confirmer au nom du membre',
					class: 'text-blue-500',
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
	<button
		class="btn btn-square btn-sm btn-ghost opacity-70 relative"
		use:tip={{ content: stateDisplay.label }}
	>
		<stateDisplay.icon class={stateDisplay.class} />
	</button>
{:else}
	<Popover listenFocus={false} class="p-1">
		{#snippet trigger({ trigger })}
			<button
				type="button"
				class="relative btn btn-sm z-10 {!isConfirmation || !canBeLarge
					? 'btn-square'
					: 'max-sm:btn-square'}"
				{...trigger}
				use:tip={{ content: stateDisplay.label }}
			>
				<stateDisplay.icon class={stateDisplay.class} />
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

		{#snippet children({ hide })}
			<form
				{...remoteForm.enhance(
					enhanceForm({
						success: 'Status changé',
						onsuccess: () => {
							hide()
							onsuccess?.()
						},
					})
				)}
				class="flex flex-col gap-1"
			>
				<input type="hidden" name="subscribeId" value={subscribe.id} />
				{#each editions as [state, edit] (state)}
					{@const EditIcon = edit.icon}
					<!-- `stopPropagation`: le popover reste dans le flux DOM de la ligne de période,
					     dont le clic ouvre le tiroir. -->
					<button
						class="menu-item w-full"
						name="state"
						value={state}
						onclick={(event) => event.stopPropagation()}
					>
						<EditIcon class={edit.class} />
						{edit.label}
					</button>
				{/each}
			</form>
		{/snippet}
	</Popover>
{/if}
