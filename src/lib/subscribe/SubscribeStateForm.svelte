<script lang="ts" module>
	import {
		CheckIcon,
		type IconProps,
		OctagonAlertIcon,
		OctagonXIcon,
		Trash2Icon,
	} from '@lucide/svelte'
	import type { Component } from 'svelte'
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
	type States = Record<
		ISubscribeState,
		{ icon: Component<IconProps>; class: string; label: string }
	>
	const states: States = {
		request: { label: 'Rétablir', icon: OctagonAlertIcon, class: 'text-warning' },
		accepted: { label: 'Confirmer', icon: CheckIcon, class: 'text-success' },
		denied: { label: 'Décliner', icon: OctagonXIcon, class: 'text-error' },
		cancelled: { label: 'Annuler', icon: Trash2Icon, class: 'text-error' },
	}
</script>

<script lang="ts">
	import type { Props as TippyProps } from 'tippy.js'
	import type { Subscribe } from '@prisma/client'
	import { SubscribeState } from '$lib/subscribe'
	import { DropDown } from 'fuma'
	import { toast } from 'svelte-sonner'
	import { page } from '$app/state'
	import { setSubscribeState } from './subscribeState.remote'

	interface Props {
		subscribe: Subscribe & { member: { isValidedByUser: boolean } }
		isLeader?: boolean
		tippyProps?: Partial<TippyProps>
		canBeLarge?: boolean
		/** Remplacent les évènements de la version Svelte 4. */
		onsuccess?: () => void
	}

	let {
		subscribe,
		isLeader = false,
		tippyProps = {},
		canBeLarge = false,
		onsuccess,
	}: Props = $props()

	let isSelf = $derived(subscribe.memberId === page.data.member?.id)

	// Un formulaire par inscription: le composant est rendu en liste.
	const remoteForm = $derived(setSubscribeState.for(subscribe.id))

	let creatorStates: Partial<States> = $derived(
		creatorEditions[subscribe.state].reduce((acc, cur) => ({ ...acc, [cur]: states[cur] }), {})
	)
	let subscriberStates: Partial<States> = $derived(
		subscriberEditions[subscribe.state].reduce((acc, cur) => ({ ...acc, [cur]: states[cur] }), {})
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
					...states.accepted,
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

		<form
			{...remoteForm.enhance(async ({ submit }) => {
				await submit()
				toast.success('Status changé')
				onsuccess?.()
			})}
			class="flex flex-col gap-1"
		>
			<input type="hidden" name="subscribeId" value={subscribe.id} />
			{#each editions as [state, edit] (state)}
				{@const EditIcon = edit.icon}
				<button
					class="menu-item"
					name="state"
					value={state}
					onclick={(event) => event.stopPropagation()}
				>
					<EditIcon class={edit.class} />
					{edit.label}
				</button>
			{/each}
		</form>
	</DropDown>
{/if}
