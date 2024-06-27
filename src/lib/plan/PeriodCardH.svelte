<script lang="ts">
	import dayjs from 'dayjs'
	import 'dayjs/locale/fr-ch'
	import { formatRangeHour } from '$lib/formatRange'
	import Progress from '$lib/Progress.svelte'
	import DragButton from './DragButton.svelte'
	import { urlParam } from 'fuma'
	import { time } from './utils'
	import { updatePeriod } from './updatePeriod'
	import type { PeriodWithSubscribesUserName } from './types'
	import { ctrl } from '$lib/store'

	export let period: PeriodWithSubscribesUserName
	export let hourSize: number
	export let origin: dayjs.Dayjs
	// TODO: use store for showSubscribes
	export let showSubscribes = true

	let deltaStartMs = 0
	let deltaEndMs = 0

	$: msSize = time(hourSize).to('hour')
	$: left = msSize * (-origin.diff(period.start) + magnet(deltaStartMs))
	$: width =
		msSize * (dayjs(period.end).diff(period.start) - magnet(deltaStartMs) + magnet(deltaEndMs))

	async function handleGrabDone() {
		const start = new Date(period.start.getTime() + magnet(deltaStartMs))
		const end = new Date(period.end.getTime() + magnet(deltaEndMs))
		await updatePeriod({ ...period, start, end })
		period = { ...period, start, end }
		deltaStartMs = 0
		deltaEndMs = 0
	}

	function magnet(ms: number): number {
		if ($ctrl) return ms
		return time(ms).roundBy(15, 'minute')
	}
</script>

<div class="w-0">
	<div
		id={period.id}
		class="
			group relative
			bg-base-200/50
			border rounded-md p-0 text-sm
			hover:z-10
			hover:outline outline-1 outline-secondary
			overflow-visible shadow min-h-14 h-full
		"
		class:outline={$urlParam.hasValue('form_period', period.id)}
		style:transform="translateX({left}px)"
		style:width="{width}px"
	>
		<DragButton
			class="top-1/2"
			orientation="horizontal"
			on:done={handleGrabDone}
			on:move={({ detail: delta }) => {
				deltaStartMs = delta.x / msSize
			}}
		/>
		<DragButton
			class="left-full top-1/2"
			orientation="horizontal"
			on:done={handleGrabDone}
			on:move={({ detail: delta }) => {
				deltaEndMs = delta.x / msSize
			}}
		/>
		<DragButton
			class="left-1/2 top-full"
			on:done={handleGrabDone}
			on:move={({ detail: delta }) => {
				deltaStartMs = delta.x / msSize
				deltaEndMs = delta.x / msSize
			}}
		/>

		<Progress {period} class="justify-between" badgeClass="mr-1" progressClass="bg-red-400">
			<span slot="before-badge" class="text-xs font-semibold ml-1">
				{formatRangeHour({
					start: period.start.getTime() + magnet(deltaStartMs),
					end: period.end.getTime() + magnet(deltaEndMs),
				})}
			</span>
		</Progress>

		{#if showSubscribes}
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
	</div>
</div>
