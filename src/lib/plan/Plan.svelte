<script lang="ts">
	import { onMount } from 'svelte'
	import dayjs, { type Dayjs } from 'dayjs'
	import 'dayjs/locale/fr-ch'
	import { Icon } from '$lib/material'
	import { Period, Subscribe, Team } from '@prisma/client'
	import PeriodCard from './PeriodCard.svelte'
	import WorkInProgress from '$lib/WorkInProgress.svelte'
	import { eventPath } from '$lib/store'
	import { tip } from '$lib/action'
	import { mdiMagnifyMinusOutline, mdiMagnifyPlusOutline } from '@mdi/js'
	dayjs.locale('fr-ch')

	export let teams: (Team & { periods: (Period & { subscribes: Subscribe[] })[] })[]

	onMount(() => {
		if (!document.location.hash) return
		const periodEl = document.querySelector<HTMLLinkElement>(document.location.hash)
		if (!periodEl) return
		periodEl.classList.add('outline')
		scrollContainer.scroll({
			top: periodEl.offsetTop - 80,
			left: periodEl.parentElement!.offsetLeft,
			behavior: 'smooth',
		})
	})

	const headerHeight = 40
	const hourHeight = 40
	let scale = 6
	let containerWidth = 0
	let scrollContainer: HTMLDivElement

	const periods = teams
		.map(({ periods }) => periods.map((p) => [p.start.getTime(), p.end.getTime()]))
		.flat(2)
		.sort()

	const range = {
		start: dayjs(periods[0]).startOf('day'),
		end: dayjs(periods.at(-1)).endOf('day'),
	}

	const days: Dayjs[] = []
	for (let day = range.start; day.isBefore(range.end); day = day.add(1, 'day')) {
		days.push(day)
	}

	const scales = [1, 2, 6, 12, 24]
	const zoom = (() => {
		let index = scales.indexOf(scale) || 3
		return {
			in: () => {
				if (!scales[index + 1]) return
				scale = scales[++index]
			},
			out: () => {
				if (!scales[index - 1]) return
				scale = scales[--index]
			},
		}
	})()

	$: hours = Array(scale)
		.fill(0)
		.map((v, index) => ((24 / scale) * (index + 1)).toString().padStart(2, '0'))
</script>

<WorkInProgress />

<div class="flex gap-2 justify-end">
	<button class="btn btn-square btn-sm" on:click={zoom.out} disabled={scale <= scales[0]}>
		<Icon path={mdiMagnifyMinusOutline} />
	</button>
	<button
		class="btn btn-square btn-sm"
		on:click={zoom.in}
		disabled={scale >= scales[scales.length + 1]}
	>
		<Icon path={mdiMagnifyPlusOutline} />
	</button>
</div>

<div
	bind:this={scrollContainer}
	class=" max-h-[100vh]
			overflow-auto table-pin-cols bordered
			snap-x scroll-pl-16 scroll-p-20
		"
>
	<div
		class="flex min-w-max pr-2 z-10"
		style="--container-width: {containerWidth}px;"
		bind:offsetWidth={containerWidth}
	>
		<div class="sticky left-0 z-20 bg-base-100">
			<!-- Header -->
			<div style:height="{headerHeight}px" />

			<!-- Scale -->
			{#each days as day}
				<div class="w-16">
					<div
						class="sticky top-0 bg-base-100 pr-2 border-b border-r z-10"
						style:height="{hourHeight}px"
					>
						<div class="text-sm font-medium">{day.format('ddd D')}</div>
						<div class="text-xs">{day.format('MMMM')}</div>
					</div>
					<div>
						{#each hours.slice(0, -1) as hour}
							<div
								class="flex items-center bg-base-100 text-center font-light border-r"
								style:height="{hourHeight}px"
							>
								<span class="grow text-sm">
									{hour}
								</span>
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>

		<!-- Scale rows -->
		<div class="w-0">
			<div class="scale" style:height="{headerHeight}px" />
			{#each days as day}
				{#each hours as hour}
					<div class="scale" style:height="{hourHeight}px" />
				{/each}
			{/each}
		</div>

		{#each teams as team}
			<div class="snap-start pl-2 relative">
				<div
					class="w-36 sticky top-0 pb-2 z-10"
					style:height="{headerHeight}px"
					style:scrollPaddingTop="{headerHeight}px"
					use:tip={{ content: team.name }}
				>
					<div
						class="relative flex items-center rounded bg-base-200 h-full px-2 outline outline-base-100"
					>
						<a href="{$eventPath}/teams/{team.id}" class="absolute inset-0">{' '}</a>
						<span class="overflow-hidden whitespace-nowrap text-ellipsis font-medium">
							{team.name}
						</span>
					</div>
				</div>

				{#each team.periods as period}
					<PeriodCard {period} origin={range.start} {hourHeight} {headerHeight} {scale} />
				{/each}
			</div>
		{/each}
	</div>
</div>

<style>
	.scale {
		position: relative;
	}
	.scale::after {
		content: ' ';
		position: absolute;
		height: 100%;
		width: calc(var(--container-width) - 64px);
		border-bottom-width: 1px;
	}
</style>
