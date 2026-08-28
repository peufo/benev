<script lang="ts">
	import { urlParam } from 'fuma'
	import { daytz } from '$lib/dayjs'

	import { SubscribeStateForm } from '$lib/subscribe'
	import Progress from '$lib/Progress.svelte'

	import type { PeriodWithComputedValues, TeamWithComputedValues } from '$lib/server/team'
	import { TagsList } from '$lib/tag'

	interface Props {
		period: PeriodWithComputedValues & { team: TeamWithComputedValues }
		/** Remplacent les évènements de la version Svelte 4. */
		onclickPeriod?: (value: PeriodWithComputedValues) => void
	}

	let { period, onclickPeriod }: Props = $props()

	function handlePeriodClick(event: Event) {
		if (clickInteractiveElement(event)) return
		onclickPeriod?.(period)
	}

	function clickInteractiveElement(event: Event) {
		const target = event.target as HTMLElement
		const currentTarget = event.currentTarget as HTMLElement
		const buttons = [...currentTarget.querySelectorAll('button, [data-tippy-root]')]
		return !!buttons.filter((btn) => btn.contains(target)).length
	}
</script>

<div
	role="button"
	tabindex="0"
	class="menu-item flex-wrap gap-y-1"
	class:disabled={period.isDisabled}
	class:active={urlParam.has('form_period', period.id)}
	onclick={handlePeriodClick}
	onkeydown={handlePeriodClick}
>
	<div class="flex gap-1 flex-wrap items-center">
		<span class="text-sm" class:opacity-80={period.isDisabled}>
			<!-- {formatRange(period)} -->
			{daytz(period.start).format('dddd, DD.MM.YY, HH:mm —')}
			{daytz(period.end).format('HH:mm')}
		</span>
		<TagsList tags={period.tags} />
	</div>

	<div class="flex gap-3 ml-auto">
		{#if period.mySubscribe}
			<SubscribeStateForm subscribe={period.mySubscribe} isLeader={!!period.team.isLeader} />
		{/if}
		<Progress {period} class="w-15" />
	</div>
</div>
