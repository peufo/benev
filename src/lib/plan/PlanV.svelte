<script lang="ts">
	import { onMount } from 'svelte'
	import dayjs from 'dayjs'
	import 'dayjs/locale/fr-ch'
	import { urlParam, type Range } from 'fuma'
	import type { Team } from '@prisma/client'
	import { getDays } from './getDays'
	import TeamCol from './TeamCol.svelte'
	import type { PeriodWithSubscribesUserName } from './types'
	dayjs.locale('fr-ch')

	export let teams: (Team & { periods: PeriodWithSubscribesUserName[] })[]
	export let scrollContainer: HTMLDivElement | undefined = undefined
	let klass = ''
	export { klass as class }
	export let range: Range
	export let msSize: number

	onMount(() => {
		const periodId = $urlParam.get('form_period')
		if (!periodId) return
		const periodIdIsCUID = periodId.length === 25 && periodId.match(/\w{25}/)
		if (!periodIdIsCUID) return
		const periodEl = document.querySelector<HTMLLinkElement>(`#${periodId}`)
		if (!periodEl) return
		scrollContainer?.scroll({
			top: periodEl.offsetTop - 80,
			left: periodEl.parentElement!.offsetLeft,
			behavior: 'smooth',
		})
	})

	const TEAM_HEADER_HEIGHT = 40
	const MS_TO_HOUR = 3_600_000

	$: origin = dayjs(range.start).startOf('hour')
	$: days = getDays(range)
	$: totalHeight =
		TEAM_HEADER_HEIGHT +
		days.reduce((acc, { hours }) => acc + hours.length, 0) * msSize * MS_TO_HOUR
</script>

<div bind:this={scrollContainer} class="{klass} flex max-h-full bg-base-100 overflow-auto">
	<!-- SCALE -->
	<div class="sticky left-0 z-10" style:margin-top="{TEAM_HEADER_HEIGHT}px">
		{#each days as { date, hours }}
			<div class="bg-base-100/95 px-1">
				<!-- DAY -->
				<div
					style:top="{TEAM_HEADER_HEIGHT}px"
					class="font-medium sticky top-0 h-0 border-t text-sm"
				>
					<div class="text-sm font-medium bg-base-100 whitespace-nowrap">
						{date.format('ddd D')}
					</div>
					<div class="text-xs bg-base-100">{date.format('MMMM')}</div>
				</div>
				<!-- HOURS -->
				<div class="flex flex-col items-end text-sm text-right w-full">
					{#each hours as hour}
						<div
							style:height="{msSize * MS_TO_HOUR}px"
							class="opacity-0 odd:opacity-100 border-t px-1"
						>
							{hour.toString().padStart(2, '0')}
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>

	{#each teams as team}
		<div class="border-t" style:height="{totalHeight}px">
			<div
				style:height="{TEAM_HEADER_HEIGHT}px"
				class="p-1 sticky top-0 bg-base-100/95 z-50 font-medium"
			>
				{team.name}
			</div>

			<TeamCol {team} {origin} {msSize} />
		</div>
	{/each}
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
