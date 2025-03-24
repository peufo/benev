<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import axios from 'axios'
	import { mdiContentDuplicate } from '@mdi/js'
	import dayjs from 'dayjs'
	import 'dayjs/locale/fr-ch'
	dayjs.locale('fr-ch')
	import {
		useForm,
		InputNumber,
		InputDate,
		InputTime,
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
	import type { Period, Tag, Team } from '@prisma/client'
	import { eventPath } from '$lib/store'
	import { goto, invalidateAll } from '$app/navigation'
	import { api } from '$lib/api'
	import { TagSelectItem } from '$lib/tag'

	type P = Partial<Period & { team: Team; tags: Tag[] }>

	let klass = ''
	export { klass as class }
	export let period: P = {}
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

	const detectChange = useDetectChange(period)
	$: if (detectChange(period)) setPeriod(period)

	function useDetectChange(periodInitial: P) {
		let currentPeriod = periodInitial
		return (p: P) => {
			const isChange =
				p?.id !== currentPeriod?.id ||
				p?.maxSubscribe !== currentPeriod?.maxSubscribe ||
				p?.start?.getTime() !== currentPeriod?.start?.getTime() ||
				p?.end?.getTime() !== currentPeriod?.end?.getTime()
			currentPeriod = p
			return isChange
		}
	}

	let defaultStart = dayjs(period?.start).startOf('hour').add(1, 'hour').toDate()
	let defaultEnd = dayjs(period?.end).startOf('hour').add(3, 'hours').toDate()

	let start: Date | null = period?.start || defaultStart
	let end = period?.end || defaultEnd
	let maxSubscribe = period?.maxSubscribe || 1

	function getAbsoluteDay(date: Date): number {
		const minutes = date.getTime() / (1000 * 60)
		return Math.floor((minutes - date.getTimezoneOffset()) / (60 * 24))
	}
	function getDiffDay(d1: Date, d2: Date | null): number {
		if (!d2) return 0
		return getAbsoluteDay(d1) - getAbsoluteDay(d2)
	}

	$: basePath = `${$eventPath}/admin`
	$: diffDay = getDiffDay(end, start)
	$: addADay = diffDay === 0 && end.getHours() < (start?.getHours() || 0)

	export function setPeriod(_period: P) {
		period = _period
		start = period?.start || defaultStart
		end = period?.end || defaultEnd
		maxSubscribe = period?.maxSubscribe || 1
	}

	export function updatePeriod(updater: (p: P) => P) {
		period = updater(period || {})
	}

	async function createNextPeriod() {
		const duration = dayjs(end).diff(start, 'minute')
		const form = new FormData()
		form.append('redirectTo', $urlParam.without('form_period'))
		form.append('team', USE_COERCE_JSON + JSON.stringify({ id: period.teamId }))
		form.append('start', USE_COERCE_DATE + end.toJSON())
		form.append('end', USE_COERCE_DATE + dayjs(end).add(duration, 'minute').toJSON())
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
	{#if start}
		<input type="hidden" name="start" value="{USE_COERCE_DATE}{start.toJSON()}" />
	{/if}
	<input
		type="hidden"
		name="end"
		value="{USE_COERCE_DATE}{dayjs(end).add(+addADay, 'day').toJSON()}"
	/>

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
			bind:value={start}
			on:input={() => {
				if (!start) return
				const _end = new Date(start)
				_end.setHours(end.getHours(), end.getMinutes())
				end = _end
			}}
		/>

		<InputNumber
			key="maxSubscribe"
			label="Bénévoles"
			bind:value={maxSubscribe}
			input={{ min: 1, step: 1 }}
		/>

		<InputTime label="Début" bind:value={start} getDefaultDate={() => defaultStart} />
		<InputTime
			label="Fin"
			bind:value={end}
			hint={diffDay === 1 || addADay
				? 'Le jour suivant'
				: diffDay === 0
				? ''
				: `+ ${diffDay} jours`}
		/>
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
