<script lang="ts">
	import { CheckIcon, OctagonAlertIcon } from '@lucide/svelte'
	import { formatRangeHour } from '$lib/formatRange'
	import { urlParam } from 'fuma'
	import { magnet } from '../magnet.svelte'
	import type { PeriodWithMembers } from '../types'
	import { cardContentOptions } from './options'
	import { TagsList } from '$lib/tag'
	import { countSubscribes } from '$lib/subscribe'

	interface Props {
		period: PeriodWithMembers
		deltaStartMs: number
		deltaEndMs: number
	}

	let { period, deltaStartMs, deltaEndMs }: Props = $props()
</script>

<div class="space-y-1">
	<div class="flex gap-x-1 flex-wrap items-center">
		{#if !$cardContentOptions.hideRangetime}
			<div
				class="text-xs font-semibold m-1 whitespace-nowrap overflow-hidden text-ellipsis mr-auto"
			>
				{formatRangeHour({
					start: period.start.getTime() + magnet(deltaStartMs),
					end: period.end.getTime() + magnet(deltaEndMs),
				})}
			</div>
		{/if}

		{#if !$cardContentOptions.hideProgress}
			{@const count = countSubscribes(period)}
			<span
				class={[
					'badge badge-sm whitespace-nowrap',
					count.isComplet && 'border-secondary outline-1 outline-secondary',
				]}
			>
				{count.accepted + count.request} / {count.maxSubscribe}
			</span>
		{/if}
	</div>

	{#if $cardContentOptions.showTags && period.tags.length}
		<TagsList tags={period.tags} />
	{/if}

	{#if $cardContentOptions.showSlots}
		{@const nbEmptySlot = Math.max(period.maxSubscribe - period.subscribes.length, 0)}
		<ul class="flex flex-col gap-1">
			{#each period.subscribes as subscribe (subscribe.id)}
				{@const StateIcon = subscribe.state === 'accepted' ? CheckIcon : OctagonAlertIcon}
				<li class="badge badge-sm whitespace-nowrap">
					<span>
						{subscribe.member.firstName}
						{subscribe.member.lastName}
					</span>
					<StateIcon
						size={15}
						class="opacity-70 translate-x-1 {subscribe.state === 'accepted'
							? subscribe.isForcedValidation
								? 'text-blue-500'
								: 'text-success'
							: subscribe.member.isValidedByUser
								? 'text-warning'
								: 'text-error'}"
					/>
				</li>
			{/each}

			{#each Array(nbEmptySlot).fill(0) as _, i (i)}
				<li class="badge badge-sm whitespace-nowrap text-warning">Libre</li>
			{/each}
		</ul>
	{/if}
</div>

<a
	href={urlParam.with({ form_period: period.id })}
	class="absolute inset-0"
	data-sveltekit-noscroll
	data-sveltekit-preload-data="off"
	data-sveltekit-replacestate
>
	<!-- Espace explicite: le lien recouvre la carte et ne doit pas être vide. -->
	<!-- eslint-disable-next-line svelte/no-useless-mustaches -->
	{' '}
</a>
