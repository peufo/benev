<script lang="ts">
	import { goto } from '$app/navigation'
	import { DropDown, InputTime, type TableField } from '$lib/material'
	import { PeriodPicker } from '$lib/period'

	import { formatRange } from '$lib/formatRange'
	import { page } from '$app/stores'
	import { urlParam } from '$lib/store'
	import { jsonParse } from '$lib/jsonParse'

	type Period = { start: string; end: string }

	export let field: TableField

	let dropDown: DropDown
	const initialValue = jsonParse<{ start?: string; end?: string }>(
		$page.url.searchParams.get(field.key),
		{}
	)
	const start = initialValue.start?.split('T') || []
	const end = initialValue.end?.split('T') || []

	let period = {
		start: start[0] || '',
		end: end[0] || '',
	}
	let time = {
		start: start[1] || '00:00',
		end: end[1] || '23:59',
	}

	$: isValidPeriod = period.start && period.end && time.start && time.start

	function getLabel(_period: Period, _time: Period) {
		return formatRange({
			start: new Date(`${_period.start}T${_time.start}`),
			end: new Date(`${_period.end}T${_time.end}`),
		})
	}

	function handleSubmit() {
		dropDown.hide()
		if (!isValidPeriod) return
		goto(
			$urlParam.with(
				{
					[field.key]: JSON.stringify({
						start: `${period.start}T${time.start || '00:00'}`,
						end: `${period.end}T${time.end || '23:59'}`,
					}),
				},
				'skip',
				'take'
			),
			{ replaceState: true, noScroll: true }
		)
	}

	function handleReset() {
		dropDown.hide()
		period = { start: '', end: '' }
		time = { start: '00:00', end: '23:59' }
		goto($urlParam.without(field.key, 'skip', 'take'), { replaceState: true, noScroll: true })
	}
</script>

<th class="p-1">
	<DropDown
		bind:this={dropDown}
		on:mouseLeave={handleSubmit}
		tippyProps={{ appendTo: () => document.body }}
		class="max-h-none"
	>
		<button slot="activator" class="menu-item w-full flex-wrap gap-y-1 min-h-8">
			<span>{field.label}</span>
			{#if isValidPeriod}
				<span class="badge badge-primary badge-xs text-[0.7rem] font-normal text-white">
					{getLabel(period, time)}
				</span>
			{/if}
		</button>

		<form
			class="flex flex-col font-normal"
			on:submit|preventDefault={handleSubmit}
			data-sveltekit-replacestate
		>
			<PeriodPicker numberOfMonths={1} bind:period />

			<input
				class="hidden"
				type="text"
				name="start"
				value="{period.start}T{time.start || '00:00'}"
			/>
			<input class="hidden" type="text" name="end" value="{period.end}T{time.end || '23:59'}" />

			<div class="flex gap-2 m-2">
				<InputTime label="A partir de" bind:value={time.start} enhanceDisabled class="grow" />
				<InputTime label="Jusqu'à" bind:value={time.end} enhanceDisabled class="grow" />
			</div>

			<div class="flex flex-row-reverse gap-2 m-2">
				<button class="btn"> Valider </button>
				<button class="btn btn-ghost" type="button" on:click={handleReset}>Effacer</button>
			</div>
		</form>
	</DropDown>
</th>
