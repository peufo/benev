<script lang="ts">
	import { goto } from '$app/navigation'
	import { Icon, DropDown, InputTime } from 'fuma'
	import type { Period } from './index'
	import PeriodPicker from './PeriodPicker.svelte'
	import { mdiCalendarMonthOutline, mdiClose } from '@mdi/js'
	import { formatRange } from '$lib/formatRange'
	import { page } from '$app/stores'
	import { urlParam } from '$lib/store'

	let dropDown: DropDown
	const start = $page.url.searchParams.get('start')?.split('T') || []
	const end = $page.url.searchParams.get('end')?.split('T') || []

	let period = {
		start: start[0] || '',
		end: end[0] || '',
	}
	let time = {
		start: start[1] || '00:00',
		end: end[1] || '23:59',
	}

	$: isValidPeriod = period.start && period.end && time.start && time.start

	function getLabel(_period: Period | undefined, _time: Period) {
		if (!_period || !_period.start || !_period.end) return 'Périodes'

		return formatRange({
			start: new Date(`${_period.start}T${_time.start}`),
			end: new Date(`${_period.end}T${_time.end}`),
		})
	}

	function handleSubmit() {
		dropDown.hide()
		if (!isValidPeriod) return
		goto(
			$urlParam.with({
				start: `${period.start}T${time.start || '00:00'}`,
				end: `${period.end}T${time.end || '23:59'}`,
			}),
			{ replaceState: true, noScroll: true }
		)
	}

	function handleReset() {
		dropDown.hide()
		period = { start: '', end: '' }
		time = { start: '00:00', end: '23:59' }
		goto($urlParam.without('start', 'end'), { replaceState: true, noScroll: true })
	}
</script>

<DropDown bind:this={dropDown} on:mouseLeave={handleSubmit} class="max-h-full">
	<div slot="activator" class="join">
		<button class="btn btn-sm join-item shrink flex-nowrap">
			<Icon path={mdiCalendarMonthOutline} class="opacity-60" size={20} />
			{getLabel(period, time)}
		</button>
		{#if isValidPeriod}
			<button class="btn btn-sm btn-square join-item" on:click|preventDefault={handleReset}>
				<Icon path={mdiClose} class="fill-base-content" />
			</button>
		{/if}
	</div>

	<form class="flex flex-col" on:submit|preventDefault={handleSubmit} data-sveltekit-replacestate>
		<PeriodPicker numberOfMonths={1} bind:period />

		<input class="hidden" type="text" name="start" value="{period.start}T{time.start || '00:00'}" />
		<input class="hidden" type="text" name="end" value="{period.end}T{time.end || '23:59'}" />

		<div class="flex gap-2 p-2">
			<InputTime label="A partir de" bind:value={time.start} enhanceDisabled class="grow" />
			<InputTime label="Jusqu'à" bind:value={time.end} enhanceDisabled class="grow" />
		</div>
		<button class="btn m-2"> Valider </button>
	</form>
</DropDown>
