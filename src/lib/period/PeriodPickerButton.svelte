<script lang="ts">
	import { Icon, ButtonMenu, InputTime } from '$lib/material'
	import type { Period } from './index'
	import PeriodPicker from './PeriodPicker.svelte'
	import { mdiCalendarMonthOutline, mdiClose } from '@mdi/js'
	import { formatRange } from '$lib/formatRange'
	import { page } from '$app/stores'

	export let action = ''

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

	let menu: ButtonMenu
	let formElement: HTMLFormElement

	function getLabel(_period: Period | undefined, _time: Period) {
		if (!_period || !_period.start || !_period.end) return 'Pas de filtre sur la période'
		if (_time.start === 'undefined') _time.start = '00:00'
		if (_time.end === 'undefined') _time.end = '23:59'

		return formatRange({
			start: new Date(`${_period.start}T${_time.start}`),
			end: new Date(`${_period.end}T${_time.end}`),
		})
	}

	function handleMouseLeave() {
		formElement?.submit()
	}
</script>

<ButtonMenu label={getLabel(period, time)} bind:this={menu} on:mouseLeave={handleMouseLeave}>
	<div slot="prepend-label" class="mr-2" style="opacity: 0.6;">
		<Icon path={mdiCalendarMonthOutline} />
	</div>

	<form
		{action}
		bind:this={formElement}
		class="flex flex-col gap-3 h-full"
		on:submit={() => menu.close()}
		data-sveltekit-replacestate
	>
		<PeriodPicker numberOfMonths={1} bind:period />

		<input class="hidden" type="text" name="start" value="{period.start}T{time.start || '00:00'}" />
		<input class="hidden" type="text" name="end" value="{period.end}T{time.end || '23:59'}" />

		<div class="flex justify-between items-end p-2">
			<InputTime label="A partir de" bind:value={time.start} enhanceDisabled />
			<InputTime label="Jusqu'à" bind:value={time.end} enhanceDisabled />

			<div class="flex">
				<div class="grow" />
				<button class="hidden" />
				<button
					class="btn btn-square"
					on:click|preventDefault={() => {
						formElement.reset()
					}}
				>
					<Icon path={mdiClose} class="fill-error" />
				</button>
			</div>
		</div>
	</form>
</ButtonMenu>
