<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import dayjs from 'dayjs'
	import { enhance } from '$app/forms'
	import { useForm } from '$lib/form'
	import { InputDate, InputNumber } from '$lib/material/input'
	import type { Period } from '@prisma/client'

	let klass = ''
	export { klass as class }
	export let isUpdate = false
	
	const dispatch = createEventDispatcher<{ cancel: void; success: void }>()
	const form = useForm({
		successReset: false,
		successMessage: isUpdate ? 'Succès' : 'Période ajoutée',
		successCallback: () => {
			dispatch('success')
		},
	})
	
	let period: Period | undefined = undefined
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

	export function setPeriod(_period: Period) {
		period = _period
		start = dayjs(period.start).format('YYYY-MM-DDTHH:mm')
		end = dayjs(period.end).format('YYYY-MM-DDTHH:mm')
	}

</script>

<form
	action={isUpdate ? '?/update_period' : '?/new_period'}
	method="post"
	use:enhance={form.submit}
	class={klass}
>
	{#if isUpdate}
		<h2 class="text-xl">Modification de la periode</h2>
	{/if}


	<div class="flex flex-wrap gap-2 items-end">
		<div class="flex gap-2 grow flex-wrap-reverse">
			{#if isUpdate && period}
				<input type="hidden" name="id" value={period.id} />
			{/if}

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
				value={String(period?.maxSubscribe || 1)}
				input={{ min: 1, step: 1 }}
			/>
		</div>

		<div class="flex gap-2 grow">
			{#if isUpdate}
				<button class="btn btn-ghost" on:click|preventDefault={() => dispatch('cancel')}>
					Annuler
				</button>
				<div class="grow" />
				<button class="btn btn-error btn-outline" formaction="?/delete_period">
					Supprimer
				</button>
				<button class="btn" type="submit">Valider</button>
			{:else}
				<button
					type="button"
					class="btn btn-ghost grow"
					class:btn-disabled={!start || !end}
					on:click|preventDefault={getNextPeriod}
				>
					Suivante
				</button>
				<button class="btn grow" type="submit">Ajouter</button>
			{/if}
		</div>
	</div>
</form>
