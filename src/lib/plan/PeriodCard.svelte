<script lang="ts">
	import dayjs from 'dayjs'
	import 'dayjs/locale/fr-ch'
	import type { Period, Subscribe } from '@prisma/client'
	import { formatRangeHour } from '$lib/formatRange'
	import Progress from '$lib/Progress.svelte'
	import DragButton from './DragButton.svelte'
	import { USE_COERCE_DATE, urlParam } from 'fuma'
	import { eventPath } from '$lib/store'
	import axios from 'axios'
	import { toast } from 'svelte-sonner'
	import { goto, invalidateAll } from '$app/navigation'

	export let period: Period & { subscribes: Subscribe[] }
	export let origin: dayjs.Dayjs
	export let msHeight: number
	export let headerHeight: number

	let deltaStart = 0
	let deltaEnd = 0

	$: top = -origin.diff(period.start) * msHeight + headerHeight + deltaStart
	$: height = dayjs(period.end).diff(period.start) * msHeight - deltaStart + deltaEnd

	function roundMs(ms: number, nbMinutes = 15) {
		const round = 60_000 * nbMinutes
		return Math.round(ms / round) * round
	}

	async function updatePeriod() {
		const start = new Date(period.start.getTime() + roundMs(deltaStart / msHeight))
		const end = new Date(period.end.getTime() + roundMs(deltaEnd / msHeight))
		const form = new FormData()
		form.append('id', period.id)
		form.append('start', USE_COERCE_DATE + start.toUTCString())
		form.append('end', USE_COERCE_DATE + end.toUTCString())
		const res = await axios.postForm(`${$eventPath}/teams/${period.teamId}?/period_update`, form)
		if (res.data.status !== 200) {
			toast.error('Erreur')
			console.error(res.data)
			return
		}
		period = { ...period, start, end }
		deltaStart = 0
		deltaEnd = 0
		toast.success('Période mise à jour')
		await invalidateAll()
	}
</script>

<div
	id={period.id}
	class="
		group
		absolute left-0 right-0
		bg-base-300/50
		border rounded-md p-0 text-sm
		hover:z-10
		hover:outline outline-1 outline-secondary
		overflow-visible shadow min-h-[30px]
	"
	class:outline={$urlParam.hasValue('form_period', period.id)}
	style:top="{top}px"
	style:height="{height}px"
>
	<DragButton
		class="left-1/2"
		orientation="horizontal"
		on:done={updatePeriod}
		on:move={({ detail: delta }) => {
			deltaStart = delta
		}}
	/>
	<DragButton
		class="left-1/2 top-full"
		orientation="horizontal"
		on:done={updatePeriod}
		on:move={({ detail: delta }) => {
			deltaEnd = delta
		}}
	/>
	<DragButton
		class="left-full top-1/2"
		on:done={updatePeriod}
		on:move={({ detail: delta }) => {
			deltaStart = delta
			deltaEnd = delta
		}}
	/>

	<Progress {period} class="justify-between" badgeClass="mr-1" progressClass="bg-red-400">
		<span slot="before-badge" class="text-xs font-semibold ml-1">
			{formatRangeHour({
				start: period.start.getTime() + roundMs(deltaStart / msHeight),
				end: period.end.getTime() + roundMs(deltaEnd / msHeight),
			})}
		</span>
	</Progress>

	<a
		href={$urlParam.with({ form_period: period.id })}
		class="absolute inset-0"
		data-sveltekit-noscroll
		data-sveltekit-replacestate>{' '}</a
	>
</div>
