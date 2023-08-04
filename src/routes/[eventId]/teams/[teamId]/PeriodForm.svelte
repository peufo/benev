<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import dayjs from 'dayjs'
	import { enhance } from '$app/forms'
	import { useForm } from '$lib/form'
	import { InputDate, InputNumber } from '$lib/material/input'

	let klass = ''
	export { klass as class }
	const dispatch = createEventDispatcher<{ cancel: void; success: void }>()
	const form = useForm({
		successReset: false,
		successMessage: 'Période ajoutée',
		successCallback: () => {
			dispatch('success')
		},
	})

	let start = ''
	let end = ''

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
</script>

<form action="?/new_period" method="post" use:enhance={form.submit} class={klass}>
	<div class="flex flex-wrap gap-2 items-end">
		<div class="flex gap-2 grow flex-wrap-reverse">
			<InputDate
				key="start"
				label="Début"
				input={{ step: 300 }}
				bind:value={start}
				on:blur={handleStartBlur}
				class="grow"
			/>
			<InputDate
				key="end"
				label="Fin"
				input={{ step: 300 }}
				bind:value={end}
				on:blur={handleEndBlur}
				class="grow"
			/>
			<InputNumber
				key="maxSubscribe"
				label="Nombre de bénévole"
				class="max-w-[150px]"
				input={{ min: 1, step: 1, value: 1 }}
			/>
		</div>


		<div class="flex gap-2 grow">
			<button
				type="button"
				class="btn btn-ghost grow"
				class:btn-disabled={!start || !end}
				on:click={getNextPeriod}
			>
				Suivante
			</button>
			<button class="btn grow" type="submit">Ajouter</button>
		</div>
	</div>
</form>
