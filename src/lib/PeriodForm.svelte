<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import dayjs from 'dayjs'
	import 'dayjs/locale/fr-ch'
	dayjs.locale('fr-ch')
	import { enhance } from '$app/forms'
	import { useForm } from '$lib/validation'
	import { InputNumber, InputDate, InputTime } from '$lib/material/input'
	import type { Period } from '@prisma/client'
	import { ButtonDelete } from 'fuma'
	import { eventPath } from '$lib/store'
	import { page } from '$app/stores'

	let klass = ''
	export { klass as class }
	export let period: Partial<Period> | undefined = undefined
	export let disableRedirect = false

	const dispatch = createEventDispatcher<{ success: void }>()

	const successMessages: Record<string, string> = {
		'?/update_period': 'Période mise à jour',
		'?/new_period': 'Période ajoutée',
		'?/delete_period': 'Période supprimée',
	}

	const form = useForm({
		successReset: false,
		successMessage: (action) => successMessages[action.search] || 'Succès',
		onSuccess: () => {
			dispatch('success')
		},
	})

	let defaultStart = dayjs().startOf('hour').add(1, 'hour').format('HH:mm')
	let defaultEnd = dayjs(period?.end).startOf('hour').add(4, 'hours').format('HH:mm')

	let date = period?.start
	let startString = period?.start ? dayjs(period.start).format('HH:mm') : defaultStart
	let endString = period?.end ? dayjs(period.end).format('HH:mm') : defaultEnd
	let maxSubscribe = String(period?.maxSubscribe || 1)

	$: dateString = dayjs(date).format('YYYY-MM-DD')
	$: endIsNextDay = endString < startString
	$: basePath = `${$eventPath}/teams/${period?.teamId || $page.params.teamId}`

	export function setPeriod(_period?: Partial<Period>) {
		period = _period
		date = period?.start
		startString = period?.start ? dayjs(period.start).format('HH:mm') : defaultStart
		endString = period?.end ? dayjs(period.end).format('HH:mm') : defaultEnd
		if (period?.maxSubscribe) maxSubscribe = String(period.maxSubscribe)
	}

	function getNextPeriod() {
		if (!startString || !endString) return

		let _start = dayjs(`${dateString}T${startString}`)
		let _end = dayjs(`${dateString}T${endString}`).add(+endIsNextDay, 'day')
		const step = _end.diff(_start, 'minute')
		_start = _end.clone()
		_end = _end.add(step, 'minute')

		date = _start.toDate()
		startString = _start.format('HH:mm')
		endString = _end.format('HH:mm')
	}
</script>

<form
	action="{basePath}{period?.id ? `/${$page.params.periodId}?/update_period` : '?/new_period'}"
	method="post"
	use:enhance={form.submit}
	class="p-2 flex flex-col gap-3 {klass}"
>
	{#if period?.id}
		<input type="hidden" name="id" value={period.id} />
	{/if}

	<input type="hidden" name="start" value={dayjs(`${dateString}T${startString}`).toJSON()} />
	<input
		type="hidden"
		name="end"
		value={dayjs(`${dateString}T${endString}`).add(+endIsNextDay, 'day').toJSON()}
	/>

	<div class="grid gap-3" style:grid-template-columns="repeat(2, minmax(80px, 1fr))">
		<InputDate label="Date" bind:value={date} />

		<InputNumber
			key="maxSubscribe"
			label="Bénévoles"
			bind:value={maxSubscribe}
			input={{ min: 1, step: 1 }}
		/>

		<InputTime label="Début" bind:value={startString} input={{ step: 300 }} />
		<InputTime
			label="Fin"
			bind:value={endString}
			hint={endIsNextDay ? 'Le jour suivant' : ''}
			input={{ step: 300 }}
		/>
	</div>

	<div class="flex flex-row-reverse gap-3 grow">
		{#if period?.id}
			{#if disableRedirect}
				<input type="hidden" name="disableRedirect" value="true" />
			{/if}
			<button class="btn" type="submit">Valider</button>
			<ButtonDelete formaction="{basePath}/{period.id}?/delete_period" />
		{:else}
			<button class="btn" type="submit">Ajouter</button>
			<button
				type="button"
				class="btn btn-ghost"
				class:btn-disabled={!startString || !endString}
				on:click|preventDefault={getNextPeriod}
			>
				Suivante
			</button>
		{/if}
	</div>
</form>
