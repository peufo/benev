<script lang="ts">
	import Progress from '$lib/Progress.svelte'
	import { formatRangeHour } from '$lib/formatRange'
	import { Icon } from '$lib/fuma-legacy'
	import { urlParam } from 'fuma'
	import { magnet } from '../magnet'
	import type { PeriodWithMembers } from '../types'
	import { cardContentOptions } from './options'
	import { mdiAlertOctagonOutline, mdiCheck } from '@mdi/js'
	import { TagsList } from '$lib/tag'

	interface Props {
		period: PeriodWithMembers
		deltaStartMs: number
		deltaEndMs: number
	}

	let { period, deltaStartMs, deltaEndMs }: Props = $props()
</script>

{#if $cardContentOptions.showProgress}
	<Progress {period} class="justify-between" badgeClass="ml-1 mr-1 mb-1" progressClass="bg-red-400">
		<!-- @migration-task: migrate this slot by hand, `before-badge` is an invalid identifier -->
		<svelte:fragment slot="before-badge">
			{#if !$cardContentOptions.hideRangetime}
				<div class="text-xs font-semibold m-1 whitespace-nowrap overflow-hidden text-ellipsis">
					{formatRangeHour({
						start: period.start.getTime() + $magnet(deltaStartMs),
						end: period.end.getTime() + $magnet(deltaEndMs),
					})}
				</div>
			{/if}
		</svelte:fragment>
	</Progress>
{:else if !$cardContentOptions.hideRangetime}
	<div class="text-xs font-semibold m-1 whitespace-nowrap overflow-hidden text-ellipsis">
		{formatRangeHour({
			start: period.start.getTime() + $magnet(deltaStartMs),
			end: period.end.getTime() + $magnet(deltaEndMs),
		})}
	</div>
{/if}

{#if $cardContentOptions.showTags && period.tags.length}
	<TagsList tags={period.tags} class="px-1 pb-1" />
{/if}

{#if $cardContentOptions.showSlots}
	{@const nbEmptySlot = Math.max(period.maxSubscribe - period.subscribes.length, 0)}
	<ul class="px-1 py-2 flex flex-col">
		{#each period.subscribes as subscribe (subscribe.id)}
			<li class="badge whitespace-nowrap">
				<span>
					{subscribe.member.firstName}
					{subscribe.member.lastName}
				</span>
				<Icon
					path={subscribe.state === 'accepted' ? mdiCheck : mdiAlertOctagonOutline}
					size={15}
					class="opacity-70 translate-x-1 {subscribe.state === 'accepted'
						? subscribe.isForcedValidation
							? 'fill-blue-500'
							: 'fill-success'
						: subscribe.member.isValidedByUser
							? 'fill-warning'
							: 'fill-error'}"
				/>
			</li>
		{/each}

		{#each Array(nbEmptySlot).fill(0) as _, i (i)}
			<li class="badge whitespace-nowrap text-warning">Libre</li>
		{/each}
	</ul>
{/if}

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
