<script lang="ts">
	import dayjs from 'dayjs'
	import 'dayjs/locale/fr-ch'
	import { formatRangeHour } from '$lib/formatRange'
	import Progress from '$lib/Progress.svelte'
	import DragButton from './DragButton.svelte'
	import { urlParam } from 'fuma'
	import { roundMinute } from './utils'
	import { updatePeriod } from './updatePeriod'
	import type { PeriodWithSubscribesUserName } from './types'

	export let period: PeriodWithSubscribesUserName
	export let msWidth: number
	export let start: dayjs.Dayjs
	export let showSubscribes = true

	let deltaStart = 0
	let deltaEnd = 0

	$: left = -start.diff(period.start) * msWidth + deltaStart
	$: width = dayjs(period.end).diff(period.start) * msWidth - deltaStart + deltaEnd

	async function handleGrabDone() {
		const start = new Date(period.start.getTime() + roundMinute(deltaStart / msWidth))
		const end = new Date(period.end.getTime() + roundMinute(deltaEnd / msWidth))
		await updatePeriod({ ...period, start, end })
		period = { ...period, start, end }
		deltaStart = 0
		deltaEnd = 0
	}
</script>

<div class="w-0">
	<div
		id={period.id}
		class="
			group relative
			bg-base-300/50
			border rounded-md p-0 text-sm
			hover:z-10
			hover:outline outline-1 outline-secondary
			overflow-visible shadow min-h-14
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
				deltaStart = delta.x
			}}
		/>
		<DragButton
			class="left-full top-1/2"
			orientation="horizontal"
			on:done={handleGrabDone}
			on:move={({ detail: delta }) => {
				deltaEnd = delta.x
			}}
		/>
		<DragButton
			class="left-1/2 top-full"
			on:done={handleGrabDone}
			on:move={({ detail: delta }) => {
				deltaStart = delta.x
				deltaEnd = delta.x
			}}
		/>

		<Progress {period} class="justify-between" badgeClass="mr-1" progressClass="bg-red-400">
			<span slot="before-badge" class="text-xs font-semibold ml-1">
				{formatRangeHour({
					start: period.start.getTime() + roundMinute(deltaStart / msWidth),
					end: period.end.getTime() + roundMinute(deltaEnd / msWidth),
				})}
			</span>
		</Progress>

		{#if showSubscribes}
			<ul>
				{#each period.subscribes as subscribe}
					<li>
						{subscribe.member.user.firstName}
						{subscribe.member.user.lastName}
					</li>
				{/each}
			</ul>
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
