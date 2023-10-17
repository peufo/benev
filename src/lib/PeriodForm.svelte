<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import dayjs from 'dayjs'
	import 'dayjs/locale/fr-ch'
	dayjs.locale('fr-ch')
	import { enhance } from '$app/forms'
	import { useForm } from '$lib/form'
	import { InputNumber, InputDate, InputTime } from '$lib/material/input'
	import type { Period } from '@prisma/client'
	import { DeleteButton } from '$lib/material'
	import { eventPath } from '$lib/store'
	import { page } from '$app/stores'

	let klass = ''
	export { klass as class }
	export let period: Period | undefined = undefined

	const dispatch = createEventDispatcher<{ success: void }>()

	const successMessages: Record<string, string> = {
		'?/update_period': 'Période mise à jour',
		'?/new_period': 'Période ajoutée',
		'?/delete_period': 'Période supprimée',
	}

	const form = useForm({
		successReset: false,
		successMessage: (action) => successMessages[action.search] || 'Succès',
		successCallback: () => {
			dispatch('success')
		},
	})
	let date = (period ? dayjs(period.start) : dayjs()).format('YYYY-MM-DD')
	let start = (period ? dayjs(period.start) : dayjs().startOf('hour').add(1, 'hour')).format(
		'HH:mm'
	)
	let end = (period ? dayjs(period.end) : dayjs().startOf('hour').add(4, 'hours')).format('HH:mm')

	$: endIsNextDay = end < start
	$: basePath = `${$eventPath}/teams/${$page.params.teamId}`

	export function setPeriod(_period: Period) {
		period = _period
		date = dayjs(period.start).format('YYYY-MM-DD')
		start = dayjs(period.start).format('HH:mm')
		end = dayjs(period.end).format('HH:mm')
		endIsNextDay = end < start
	}

	function handleInput() {}

	function handleStartBlur() {
		if (!end) end = start
	}

	function handleEndBlur() {
		if (!start) start = end
	}

	function getNextPeriod() {
		if (!start || !end) return
		const _start = dayjs(start)
		const _end = dayjs(end)
		const step = _end.diff(_start, 'minute')
		start = end
	}
</script>

<form
	action="{basePath}{!!period ? `/${$page.params.periodId}?/update_period` : '?/new_period'}"
	method="post"
	use:enhance={form.submit}
	class="p-2 flex flex-col gap-3 {klass}"
>
	{#if !!period}
		<input type="hidden" name="id" value={period.id} />
	{/if}

	<input type="hidden" name="date_start" value="{date}T{start}" />
	<input
		type="hidden"
		name="date_end"
		value={dayjs(`${date}T${end}`).add(+endIsNextDay, 'day').format('YYYY-MM-DDTHH:mm')}
	/>

	<div class="grid gap-3 grid-cols-2">
		<InputDate label="Date" bind:value={date} />

		<InputNumber
			key="maxSubscribe"
			label="Bénévoles"
			value={String(period?.maxSubscribe || 1)}
			input={{ min: 1, step: 1 }}
		/>

		<InputTime label="Début" bind:value={start} input={{ step: 300 }} />
		<InputTime
			label="Fin"
			bind:value={end}
			hint={endIsNextDay ? 'Le jour suivant' : ''}
			input={{ step: 300 }}
		/>
	</div>

	<div class="flex flex-row-reverse gap-3 grow">
		{#if !!period}
			<button class="btn" type="submit">Valider</button>
			<DeleteButton formaction="{basePath}/{period.id}?/delete_period" />
			<div class="grow" />
		{:else}
			<button class="btn grow" type="submit">Ajouter</button>
			<button
				type="button"
				class="btn btn-ghost grow"
				class:btn-disabled={!start || !end}
				on:click|preventDefault={getNextPeriod}
			>
				Suivante
			</button>
		{/if}
	</div>
</form>
