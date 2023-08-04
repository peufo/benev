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

	const tabs = [
		['add', 'Ajouter'],
		['duplicate', 'Dupliquer'],
	] as const
	let tabSelected: (typeof tabs)[number][0] = 'add'

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
	<div class="tabs">
		{#each tabs as [key, label] (key)}
			<div
				class="tab tab-lifted tab-lg grow"
				class:tab-active={tabSelected === key}
				on:click={() => (tabSelected = key)}
				on:keyup={() => (tabSelected = key)}
				role="tab"
				tabindex="0"
			>
				{label}
			</div>
		{/each}
	</div>

	<div class="card-body border border-t-0 border-base-300 rounded-b-xl">
		{#if tabSelected === 'add'}
			<div class="grid grid-cols-2 gap-2">
				<InputNumber
					key="maxSubscribe"
					label="Nombre de bénévole"
					class="col-span-2"
					input={{ min: 1, step: 1, value: 1 }}
				/>
				<InputDate
					key="start"
					label="Début"
					input={{ step: 300 }}
					bind:value={start}
					on:blur={handleStartBlur}
				/>
				<InputDate
					key="end"
					label="Fin"
					input={{ step: 300 }}
					bind:value={end}
					on:blur={handleEndBlur}
				/>
			</div>
		{:else if tabSelected === 'duplicate'}
			<h2>TODO:</h2>
			<div>Dupliquer en ajoutant ... jours à la sélection</div>
		{/if}

		<div class="flex justify-end mt-2 gap-2">
			<button class="btn btn-ghost" class:btn-disabled={!start || !end} on:click|preventDefault={getNextPeriod}>
				Continuer
			</button>
			<button class="btn">Valider</button>
		</div>
	</div>
</form>
