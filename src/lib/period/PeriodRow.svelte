<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import { Icon, formatRange, urlParam } from 'fuma'
	import { mdiClipboardTextOutline } from '@mdi/js'
	import { goto } from '$app/navigation'
	import dayjs from 'dayjs'
	import 'dayjs/locale/fr-ch'
	dayjs.locale('fr-ch')

	import { SubscribeStateForm } from '$lib/subscribe'
	import Progress from '$lib/Progress.svelte'

	import type { PeriodWithComputedValues, TeamWithComputedValues } from '$lib/server/team'

	export let period: PeriodWithComputedValues & { team: TeamWithComputedValues }
	const dispatch = createEventDispatcher<{ clickPeriod: PeriodWithComputedValues }>()

	function handlePeriodClick(event: Event) {
		if (clickInteractiveElement(event)) return

		if (period.team.isLeader) {
			const url = $urlParam.toggle({ form_period: period.id })
			return goto(url, { replaceState: true, noScroll: true, keepFocus: true })
		}
		if (!period.isDisabled) dispatch('clickPeriod', period)
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
	class="menu-item flex-wrap"
	class:cursor-pointer={!period.isDisabled}
	class:hover={!period.isDisabled}
	class:active={$urlParam.hasValue('form_period', period.id)}
	on:click={handlePeriodClick}
	on:keydown={handlePeriodClick}
>
	<span class="text-sm" class:opacity-80={period.isDisabled}>
		<!-- {formatRange(period)} -->
		{dayjs(period.start).format('dddd, DD.MM.YY, HH:mm —')}
		{dayjs(period.end).format('HH:mm')}
	</span>

	<div class="flex gap-3 ml-auto">
		<Progress {period} class="w-[60px]" />

		{#if period.team.isLeader}
			{#if period.mySubscribe}
				<SubscribeStateForm subscribe={period.mySubscribe} isLeader={!!period.team.isLeader} />
			{:else if period.isAvailable}
				<button
					class="btn btn-square btn-sm"
					on:click|stopPropagation={() => dispatch('clickPeriod', period)}
				>
					<Icon path={mdiClipboardTextOutline} size={20} title="M'inscrire à cette période" />
				</button>
			{:else}
				<div class="w-8" />
			{/if}
		{/if}
	</div>
</div>
