<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import dayjs from 'dayjs'
	import { enhance } from '$app/forms'
	import { useForm } from '$lib/form'
	import { InputDatetime, InputNumber } from '$lib/material/input'
	import type { Period } from '@prisma/client'
	import { DeleteButton } from '$lib/material'
	import { eventPath } from '$lib/store'
	import { page } from '$app/stores'

	let klass = ''
	export { klass as class }
	export let period: Period | undefined = undefined
	$: isUpdate = !!period

	const dispatch = createEventDispatcher<{ success: void }>()
	const form = useForm({
		successReset: false,
		successMessage: (action) =>
			action.search === '?/update_period' ? 'Période mise à jour' : 'Période ajoutée',
		successCallback: () => {
			dispatch('success')
		},
	})

	let start = (period ? dayjs(period.start) : dayjs().startOf('hour')).format('YYYY-MM-DDTHH:mm')
	let end = (period ? dayjs(period.end) : dayjs().startOf('hour')).format('YYYY-MM-DDTHH:mm')

	export function setPeriod(_period: Period) {
		period = _period
		start = dayjs(period.start).format('YYYY-MM-DDTHH:mm')
		end = dayjs(period.end).format('YYYY-MM-DDTHH:mm')
	}

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
		end = _end.add(step, 'minute').format('YYYY-MM-DDTHH:mm')
	}

	$: basePath = `${$eventPath}/teams/${$page.params.teamId}`
</script>

<form
	action="{basePath}{isUpdate ? `/${$page.params.periodId}?/update_period` : '?/new_period'}"
	method="post"
	use:enhance={form.submit}
	class={klass}
>
	<div class="flex flex-wrap gap-2 items-end">
		<div class="flex gap-2 grow flex-wrap">
			{#if isUpdate && period}
				<input type="hidden" name="id" value={period.id} />
			{/if}

			<InputDatetime
				key="start"
				label="Début"
				input={{ step: 300 }}
				bind:value={start}
				on:blur={handleStartBlur}
				class="grow"
			/>
			<InputDatetime
				key="end"
				label="Fin"
				input={{ step: 300 }}
				bind:value={end}
				on:blur={handleEndBlur}
				class="grow"
			/>
		</div>
		<InputNumber
			key="maxSubscribe"
			label="Nombre de bénévoles"
			class="max-w-[150px]"
			value={String(period?.maxSubscribe || 1)}
			input={{ min: 1, step: 1 }}
		/>

		<div class="flex flex-row-reverse gap-2 grow">
			{#if isUpdate}
				<button class="btn" type="submit">Valider</button>
				<DeleteButton formaction="?/delete_period" />
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
	</div>
</form>
