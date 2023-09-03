<script lang="ts">
	import { goto } from '$app/navigation'
	import { Icon, ButtonMenu, InputTime } from '$lib/material'
	import type { Period } from './index'
	import PeriodPicker from './PeriodPicker.svelte'
	import { mdiCalendarMonthOutline, mdiClose } from '@mdi/js'
	import { formatRange } from '$lib/formatRange'
	import { page } from '$app/stores'
	import { urlParam } from '$lib/store'

	export let action = ''

	let menu: ButtonMenu
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
		if (!_period || !_period.start || !_period.end) return 'Toutes les périodes'

		return formatRange({
			start: new Date(`${_period.start}T${_time.start}`),
			end: new Date(`${_period.end}T${_time.end}`),
		})
	}

	function handleSubmit() {
		menu.close()
		if (!isValidPeriod) return
		goto(
			$urlParam.with({
				start: `${period.start}T${time.start || '00:00'}`,
				end: `${period.end}T${time.end || '23:59'}`,
			}),
			{ replaceState: true }
		)
	}

	function handleReset() {
		menu.close()
		period = { start: '', end: '' }
		time = { start: '00:00', end: '23:59' }
		goto($urlParam.without('start', 'end'), { replaceState: true })
	}
</script>

<ButtonMenu bind:this={menu} on:mouseLeave={handleSubmit} dropdownClass="max-h-none">
	<div slot="btn" class="join">
		<button class="btn join-item shrink flex-nowrap" on:click={() => menu.setOpen()}>
			<Icon path={mdiCalendarMonthOutline} class="opacity-60" />
			{getLabel(period, time)}
		</button>
		{#if isValidPeriod}
			<button class="btn btn-square join-item" on:click|preventDefault={handleReset}>
				<Icon path={mdiClose} class="fill-error" />
			</button>
		{/if}
	</div>

	<form
		{action}
		class="flex flex-col"
		on:submit|preventDefault={handleSubmit}
		data-sveltekit-replacestate
	>
		<PeriodPicker numberOfMonths={1} bind:period />

		<input class="hidden" type="text" name="start" value="{period.start}T{time.start || '00:00'}" />
		<input class="hidden" type="text" name="end" value="{period.end}T{time.end || '23:59'}" />

		<div class="flex gap-2 p-2">
			<InputTime label="A partir de" bind:value={time.start} enhanceDisabled class="grow" />
			<InputTime label="Jusqu'à" bind:value={time.end} enhanceDisabled class="grow" />
		</div>
		<button class="btn m-2"> Valider </button>
	</form>
</ButtonMenu>
