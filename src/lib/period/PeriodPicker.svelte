<script lang="ts">
	import { onMount, onDestroy, createEventDispatcher } from 'svelte'
	import type Litepicker from 'litepicker'
	import dayjs from 'dayjs'
	import { page } from '$app/stores'
	import type { Period } from './index'

	export let numberOfMonths = 3
	export let numberOfColumns = numberOfMonths
	export let showWeekNumbers = true
	export let period: Period | undefined = undefined

	let startElement: HTMLInputElement
	let endElement: HTMLInputElement
	let picker: Litepicker
	let parentEl: HTMLDivElement
	const dispatch = createEventDispatcher<{ change: Period }>()

	onMount(() => {
		initTimePicker()
	})

	onDestroy(() => {
		picker?.destroy()
	})

	async function initTimePicker() {
		const _Litepicker = (await import('litepicker')).default
		picker?.destroy()
		picker = new _Litepicker({
			element: startElement,
			elementEnd: endElement,
			// Nécéssaire pour traquer le theme
			parentEl: parentEl,
			inlineMode: true,
			singleMode: false,
			allowRepick: false,
			lang: navigator.language,
			numberOfMonths,
			numberOfColumns,
			showWeekNumbers,
			startDate: period?.start ? new Date(period.start) : '',
			endDate: period?.end ? new Date(period.end) : '',
			setup: (picker: Litepicker) => {
				picker.on('selected', (date1: any, date2: any) => {
					const start = dayjs(date1.dateInstance).format('YYYY-MM-DD')
					const end = dayjs(date2.dateInstance).format('YYYY-MM-DD')
					period = {
						start,
						end,
					}
					dispatch('change', period)
				})
			},
		})
	}
</script>

<input type="hidden" bind:this={startElement} />
<input type="hidden" bind:this={endElement} />

<div bind:this={parentEl} />
