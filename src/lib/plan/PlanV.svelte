<script lang="ts">
	import { onMount } from 'svelte'
	import dayjs from 'dayjs'
	import 'dayjs/locale/fr-ch'
	import { Icon, urlParam, type Range } from 'fuma'
	import type { Team } from '@prisma/client'
	import { getDays } from './getDays'
	import TeamCol from './TeamCol.svelte'
	import type { PeriodWithSubscribesUserName } from './types'
	import { mdiPlus } from '@mdi/js'
	dayjs.locale('fr-ch')

	export let teams: (Team & { periods: PeriodWithSubscribesUserName[] })[]
	export let scrollContainer: HTMLDivElement | undefined = undefined
	let klass = ''
	export { klass as class }
	export let range: Range
	export let hourSize: number

	onMount(() => {
		const periodId = $urlParam.get('form_period')
		if (!periodId) return
		const periodIdIsCUID = periodId.length === 25 && periodId.match(/\w{25}/)
		if (!periodIdIsCUID) return
		const periodEl = document.getElementById(periodId)
		if (!periodEl) return
		scrollContainer?.scroll({
			top: periodEl.offsetTop - 80,
			left: periodEl.parentElement!.offsetLeft,
			behavior: 'smooth',
		})
	})

	const TEAM_HEADER_HEIGHT = 40
	const MIN_HOUR_HEIGHT = 30

	$: hourSpan = Math.ceil(MIN_HOUR_HEIGHT / hourSize)
	$: origin = dayjs(range.start).startOf('hour')
	$: days = getDays(range)
	$: totalHeight =
		TEAM_HEADER_HEIGHT + days.reduce((acc, { hours }) => acc + hours.length, 0) * hourSize
</script>

<div bind:this={scrollContainer} class="{klass} flex max-h-full bg-base-100 overflow-auto">
	<!-- SCALE -->
	<div class="sticky left-0 z-10" style:margin-top="{TEAM_HEADER_HEIGHT}px">
		{#each days as { date, hours }}
			<div class="bg-base-100/95">
				<!-- DAY -->
				<div
					style:top="{TEAM_HEADER_HEIGHT}px"
					class="font-medium sticky top-0 h-0 border-t text-sm px-1 -translate-y-[1px] z-10"
				>
					<div class="text-sm font-medium bg-base-100 whitespace-nowrap">
						{date.format('ddd D')}
					</div>
					<div class="text-xs bg-base-100">{date.format('MMMM')}</div>
				</div>
				<!-- HOURS -->
				<div class="flex flex-col items-end text-sm text-right -translate-y-[2px]">
					{#each hours.filter((h, i) => !(i % hourSpan)) as hour}
						{@const isEndNextDay = hour + hourSpan > 24}
						{@const span = isEndNextDay ? 24 - hour : hourSpan}
						<div style:height="{hourSize * span}px" class="border-t px-1">
							{isEndNextDay ? '' : hour.toString().padStart(2, '0')}
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>

	{#each teams as team}
		<div class="border-l" style:height="{totalHeight}px">
			<a
				href={$urlParam.with({ form_team: team.id })}
				data-sveltekit-replacestate
				data-sveltekit-noscroll
				style:height="{TEAM_HEADER_HEIGHT}px"
				class="px-1 sticky top-0 bg-base-100/95 z-50 font-medium flex items-center border-b cursor-pointer hover:bg-base-200"
			>
				<span class="text-sm">
					{team.name}
				</span>
			</a>

			<TeamCol {team} {origin} {hourSize} />
		</div>
	{/each}

	<!-- CREATE TEAM -->
	<div class="grid place-content-center px-4 sticky top-0" style:height="{TEAM_HEADER_HEIGHT}px">
		<a
			class="btn btn-square btn-sm"
			href={$urlParam.with({ form_team: 1 })}
			data-sveltekit-replacestate
			data-sveltekit-noscroll
		>
			<Icon path={mdiPlus} title="Ajouter un secteur" />
		</a>
	</div>
</div>
