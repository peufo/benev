<script lang="ts">
	import Progress from '$lib/Progress.svelte'
	import { formatRangeHour } from '$lib/formatRange'
	import { urlParam } from 'fuma'
	import { magnet } from '../magnet'
	import type { PeriodWithSubscribesUserName } from '../types'
	import { cardContentOptions } from './options'

	export let period: PeriodWithSubscribesUserName
	export let deltaStartMs: number
	export let deltaEndMs: number
</script>

{#if $cardContentOptions.showProgress}
	<Progress {period} class="justify-between" badgeClass="mr-1" progressClass="bg-red-400">
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

{#if $cardContentOptions.showSlots}
	<ol class="px-1 py-2">
		{#each period.subscribes as subscribe}
			<li class="badge whitespace-nowrap">
				{subscribe.member.user.firstName}
				{subscribe.member.user.lastName}
			</li>
		{/each}
	</ol>
{/if}

<a
	href={$urlParam.with({ form_period: period.id })}
	class="absolute inset-0"
	data-sveltekit-noscroll
	data-sveltekit-preload-data="off"
	data-sveltekit-replacestate
>
	{' '}
</a>
