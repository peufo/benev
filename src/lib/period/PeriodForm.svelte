<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import dayjs from 'dayjs'
	import 'dayjs/locale/fr-ch'
	dayjs.locale('fr-ch')
	import { useForm, InputNumber, InputDate, InputTime, ButtonDelete, USE_COERCE_DATE } from 'fuma'
	import type { Period } from '@prisma/client'
	import { eventPath } from '$lib/store'
	import { page } from '$app/stores'

	let klass = ''
	export { klass as class }
	export let period: Partial<Period> | undefined = undefined
	export let disableRedirect = false

	const dispatch = createEventDispatcher<{ success: void }>()

	const successMessages: Record<string, string> = {
		'?/period_update': 'Période mise à jour',
		'?/period_create': 'Période ajoutée',
		'?/period_delete': 'Période supprimée',
	}

	const { enhance } = useForm({
		successReset: false,
		successMessage: (action) => successMessages[action.search] || 'Succès',
		onSuccess: () => {
			dispatch('success')
		},
	})

	let defaultStart = dayjs().startOf('hour').add(1, 'hour').format('HH:mm')
	let defaultEnd = dayjs(period?.end).startOf('hour').add(4, 'hours').format('HH:mm')

	let date = period?.start || new Date()
	let startString = period?.start ? dayjs(period.start).format('HH:mm') : defaultStart
	let endString = period?.end ? dayjs(period.end).format('HH:mm') : defaultEnd
	let maxSubscribe = period?.maxSubscribe || 1

	$: dateString = dayjs(date).format('YYYY-MM-DD')
	$: endIsNextDay = endString < startString
	$: basePath = `${$eventPath}/teams/${period?.teamId || $page.params.teamId}`

	export function setPeriod(_period?: Partial<Period>) {
		period = _period
		date = period?.start || new Date()
		startString = period?.start ? dayjs(period.start).format('HH:mm') : defaultStart
		endString = period?.end ? dayjs(period.end).format('HH:mm') : defaultEnd
		if (period?.maxSubscribe) maxSubscribe = period.maxSubscribe
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
	action="{basePath}{period?.id ? `?/period_update` : '?/period_create'}"
	method="post"
	use:enhance
	class="p-2 flex flex-col gap-3 {klass}"
>
	{#if period?.id}
		<input type="hidden" name="id" value={period.id} />
	{/if}

	<input
		type="hidden"
		name="start"
		value="{USE_COERCE_DATE}{dayjs(`${dateString}T${startString}`).toJSON()}"
	/>
	<input
		type="hidden"
		name="end"
		value="{USE_COERCE_DATE}{dayjs(`${dateString}T${endString}`)
			.add(+endIsNextDay, 'day')
			.toJSON()}"
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
			<ButtonDelete formaction="{basePath}?/period_delete" />
		{:else}
			<button class="btn btn-primary" type="submit">Ajouter</button>
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