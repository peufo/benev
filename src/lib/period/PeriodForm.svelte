<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import axios from 'axios'
	import { mdiContentDuplicate } from '@mdi/js'
	import { daytz, type Dayjs } from '$lib/dayjs'
	import {
		useForm,
		InputNumber,
		InputDate,
		ButtonDelete,
		urlParam,
		USE_COERCE_DATE,
		USE_COERCE_NUMBER,
		Icon,
		InputRelation,
		USE_COERCE_JSON,
		InputRelations,
		component,
	} from 'fuma'
	import type { Period, Subscribe, Tag, Team } from '@prisma/client'
	import { eventPath } from '$lib/store'
	import { goto, invalidateAll } from '$app/navigation'
	import { api } from '$lib/api'
	import { TagSelectItem } from '$lib/tag'
	import { toast } from 'svelte-sonner'

	type PeriodProp = Partial<Period & { team: Team; tags: Tag[]; subscribes: Subscribe[] }>

	let klass = ''
	export { klass as class }
	export let period: PeriodProp = {}
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
		onSubmit({ action, cancel, submitter }) {
			if (!action.searchParams.has('/period_delete')) return
			const nb = period.subscribes?.length || 0
			if (nb === 0) return
			const msg = [
				`Cette période de travail contient déjà ${nb} inscription${nb > 1 ? 's' : ''} !`,
				'Es-tu certain de vouloir la supprimer ?',
			].join('\n')
			if (confirm(msg)) return
			cancel()
			toast.info('Suppession de la période annulée !')
			setTimeout(() => {
				submitter?.classList.remove('btn-disabled')
			}, 200)
		},
	})

	const detectChange = useDetectChange(period)
	$: if (detectChange(period)) setPeriod(period)

	function useDetectChange(periodInitial: PeriodProp) {
		let currentPeriod = periodInitial
		return (p: PeriodProp) => {
			const isChange =
				p?.id !== currentPeriod?.id ||
				p?.maxSubscribe !== currentPeriod?.maxSubscribe ||
				p?.start?.getTime() !== currentPeriod?.start?.getTime() ||
				p?.end?.getTime() !== currentPeriod?.end?.getTime()
			currentPeriod = p
			return isChange
		}
	}

	let defaultStart = daytz().startOf('hour').add(1, 'hour')
	let defaultEnd = daytz().startOf('hour').add(3, 'hours')
	let start = daytz(period.start || defaultStart)
	let end = daytz(period?.end || defaultEnd)
	let startTime = start.format('HH:mm')
	let endTime = end.format('HH:mm')

	let maxSubscribe = period?.maxSubscribe || 1

	function setTime(date: Dayjs, time: string): Dayjs {
		if (!time) return date
		const [h, m] = time.split(':').map(Number)
		return date.set('h', h).set('m', m)
	}
	function ensureAfterStart(date: Dayjs) {
		if (date.isBefore(_start) || date.isSame(_start)) return date.add(1, 'day')
		return date
	}

	$: basePath = `${$eventPath}/admin`
	$: _start = setTime(start, startTime)
	$: _end = ensureAfterStart(setTime(end, endTime))
	$: diffDay = _end.startOf('day').diff(_start.startOf('day'), 'day')

	$: console.log({
		_start: _start.format('YY-MM-DD HH:mm'),
		_end: _end.format('YY-MM-DD HH:mm'),
	})

	export function setPeriod(_period: PeriodProp) {
		period = _period
		start = daytz(period?.start || defaultStart)
		end = daytz(period?.end || defaultEnd)
		startTime = start.format('HH:mm')
		endTime = end.format('HH:mm')
		maxSubscribe = period?.maxSubscribe || 1
	}

	export function updatePeriod(updater: (p: PeriodProp) => PeriodProp) {
		period = updater(period || {})
	}

	async function createNextPeriod() {
		const duration = daytz(end).diff(start, 'minute')
		console.log({ duration })
		const nextStart = end
		const nextEnd = end.add(duration, 'minute')
		const form = new FormData()
		form.append('redirectTo', $urlParam.without('form_period'))
		form.append('team', USE_COERCE_JSON + JSON.stringify({ id: period.teamId }))
		form.append('start', USE_COERCE_DATE + nextStart.toJSON())
		form.append('end', USE_COERCE_DATE + nextEnd.toJSON())
		form.append('maxSubscribe', USE_COERCE_NUMBER + maxSubscribe)
		form.append(
			'tags',
			USE_COERCE_JSON + JSON.stringify(period.tags?.map((t) => ({ id: t.id })) || [])
		)
		const res = await axios.postForm(`${basePath}?/period_create`, form)
		if (res.data.type === 'redirect')
			await goto(res.data.location, { invalidateAll: true, noScroll: true })
		else await invalidateAll()
	}
</script>

<form
	action="{basePath}{period?.id ? `?/period_update` : '?/period_create'}"
	method="post"
	use:enhance
	class="p-2 flex flex-col gap-3 {klass}"
>
	<input type="hidden" name="redirectTo" value={$urlParam.without('form_period')} />

	{#if period?.id}
		<input type="hidden" name="id" value={period.id} />
	{/if}
	{#if _start}
		<input type="hidden" name="start" value="{USE_COERCE_DATE}{_start.toJSON()}" />
	{/if}
	<input type="hidden" name="end" value="{USE_COERCE_DATE}{_end.toJSON()}" />

	{#key period}
		<InputRelation
			value={period.team}
			key="team"
			search={$api.team.search}
			slotItem={(item) => item.name}
			label="Secteur"
		/>
		<InputRelations
			value={period.tags}
			key="tags"
			search={$api.tag.search}
			slotItem={(tag) => component(TagSelectItem, { tag, is_editable: true })}
			slotSuggestion={(tag) => component(TagSelectItem, { tag })}
			label="Étiquettes"
			createUrl={$urlParam.with({ form_tag: '{}' })}
			createTitle="Nouvelle étiquette"
		/>
	{/key}

	<div class="grid gap-3" style:grid-template-columns="repeat(2, minmax(80px, 1fr))">
		<InputDate
			label="Date"
			value={start.toDate()}
			on:input={({ detail: value }) => {
				if (!value) return
				// start.toDate() is not a good idea !
				start = daytz(value)
			}}
		/>

		<InputNumber
			key="maxSubscribe"
			label="Bénévoles"
			bind:value={maxSubscribe}
			input={{ min: 1, step: 1 }}
		/>
		<div class="form-control">
			<label for="startTime" class="label">
				<span class="label-text">Début</span>
			</label>
			<input
				type="time"
				id="startTime"
				class="input input-bordered"
				step={300}
				bind:value={startTime}
			/>
		</div>
		<div class="form-control">
			<label for="endTime" class="label">
				<span class="label-text">Fin</span>
				{#if diffDay !== 0}
					<span class="label-text-alt">
						+ {diffDay} jours
					</span>
				{/if}
			</label>
			<input
				type="time"
				id="endTime"
				class="input input-bordered"
				step={300}
				bind:value={endTime}
			/>
			{#if diffDay !== 0}
				<div class="flex pt-1 join">
					<button type="button" class="btn btn-xs join-item">-</button>
					<input
						type="date"
						name="end"
						class="input input-xs input-bordered input-ghost join-item"
					/>
					<button type="button" class="btn btn-xs join-item">+</button>
				</div>
			{/if}
		</div>
	</div>

	<div class="flex flex-row-reverse gap-3 grow">
		{#if period?.id}
			{#if disableRedirect}
				<input type="hidden" name="disableRedirect" value="true" />
			{/if}
			<button class="btn btn-primary" type="submit">Valider</button>
			<button
				type="button"
				class="btn btn-primary"
				class:btn-disabled={!start || !end}
				on:click|preventDefault={createNextPeriod}
			>
				<Icon path={mdiContentDuplicate} title="Dupliquer après" />
			</button>
			<div class="grow" />
			<ButtonDelete formaction="{basePath}?/period_delete" />
		{:else}
			<button class="btn btn-primary" type="submit">Ajouter</button>
		{/if}
	</div>
</form>
