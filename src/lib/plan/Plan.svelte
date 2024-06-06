<script lang="ts">
	import { onMount } from 'svelte'
	import dayjs, { type Dayjs } from 'dayjs'
	import 'dayjs/locale/fr-ch'
	import { tip, Icon, urlParam } from 'fuma'
	import type { Period, Subscribe, Team } from '@prisma/client'
	import { mdiPlus } from '@mdi/js'

	import PeriodCard from '$lib/plan/PeriodCard.svelte'
	import { eventPath } from '$lib/store'
	import { newPeriod } from './newPeriod'
	import { getRangeOfTeams } from './getRange'
	dayjs.locale('fr-ch')

	export let teams: (Team & { periods: (Period & { subscribes: Subscribe[] })[] })[]
	export let scale = 12
	export let scrollContainer: HTMLDivElement | undefined = undefined
	let klass = ''
	export { klass as class }

	const headerHeight = 40
	const hourHeight = 40

	$: msHeight = (hourHeight * (scale / 24)) / (1000 * 60 * 60)

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

	let containerWidth = 0
	let range: { start: Dayjs; end: Dayjs }
	let days: Dayjs[] = []

	$: {
		range = getRangeOfTeams(teams)
		const newDays: Dayjs[] = []
		for (let day = range.start; day.isBefore(range.end); day = day.add(1, 'day')) {
			newDays.push(day)
		}
		days = newDays
	}

	$: hours = Array(Math.round(scale))
		.fill(0)
		.map((v, index) => ((24 / scale) * (index + 1)).toString().padStart(2, '0'))
</script>

<div
	bind:this={scrollContainer}
	class="
		{klass}
		max-w[100hw] bg-base-100 rounded
		overflow-auto table-pin-cols bordered
		snap-x scroll-pl-16 scroll-p-20
	"
>
	<div
		class="flex min-w-max pr-2 z-10 gap-2 p-1"
		style="--container-width: {containerWidth}px;"
		bind:offsetWidth={containerWidth}
		use:newPeriod={{ origin: range.start, headerHeight, msHeight }}
	>
		<div class="sticky left-0 z-20 bg-base-100">
			<!-- Header -->
			<div style:height="{headerHeight}px" />

			<!-- Scale -->
			{#each days as day}
				<div class="w-16">
					<div
						class="sticky top-0 bg-base-100 pr-2 border-t border-r z-10 -translate-y-[1px]"
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

		{#each teams as team (team.id)}
			<div
				class="snap-start scroll-mx-2 pl-0 relative"
				data-team={JSON.stringify({ id: team.id, name: team.name })}
			>
				<div
					class="w-36 sticky top-0 pb-2 z-10"
					style:height="{headerHeight}px"
					style:scrollPaddingTop="{headerHeight}px"
					use:tip={{ content: team.name, appendTo: 'parent' }}
				>
					<a
						href="{$eventPath}/teams/{team.id}"
						class="
							flex items-center rounded bg-base-100
							h-full px-2 outline outline-base-100
							text-sm font-semibold border
					"
					>
						<span class="overflow-hidden whitespace-nowrap text-ellipsis">
							{team.name}
						</span>
					</a>
				</div>

				{#each team.periods as period}
					<PeriodCard {period} origin={range.start} {msHeight} {headerHeight} />
				{/each}
			</div>
		{/each}

		<a class="btn btn-sm z-50 sticky top-0" href={$urlParam.with({ form_team: 1 })}>
			<Icon path={mdiPlus} title="Nouveau secteur" />
			<span>Ajouter</span>
		</a>
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
