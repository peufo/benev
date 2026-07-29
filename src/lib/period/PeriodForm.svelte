<script lang="ts">
	import { mdiContentDuplicate } from '@mdi/js'
	import { daytz, type Dayjs } from '$lib/dayjs'
	import { Icon, InputRelation, InputRelations, component } from '$lib/fuma-legacy'
	import { ButtonDelete, urlParam } from 'fuma'
	import type { Period, Subscribe, Tag, Team } from '@prisma/client'
	import { goto, invalidateAll } from '$app/navigation'
	import { api } from '$lib/api'
	import { TagSelectItem } from '$lib/tag'
	import { toast } from 'svelte-sonner'
	import InputDateTime from './InputDateTime.svelte'
	import { createPeriod, deletePeriod, duplicatePeriod, updatePeriod } from './period.remote'

	type PeriodProp = Partial<Period & { team: Team; tags: Tag[]; subscribes: Subscribe[] }>

	interface Props {
		class?: string
		period?: PeriodProp
		disableRedirect?: boolean
		/** Remplacent les évènements de la version Svelte 4. */
		onsuccess?: () => void
		ondelete?: () => void
	}

	let {
		class: klass = '',
		period = $bindable({}),
		disableRedirect = false,
		onsuccess,
		ondelete,
	}: Props = $props()

	const remoteForm = $derived(period?.id ? updatePeriod : createPeriod)

	const detectChange = useDetectChange(period)

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
	let start = $state(daytz(period.start || defaultStart))
	let end = $state(daytz(period?.end || defaultEnd))

	let maxSubscribe = $state(period?.maxSubscribe || 1)
	let selectedTeam: Team | null = $state(period.team ?? null)
	let selectedTags: Tag[] | null = $state(period.tags ?? null)

	// ATTENTION runtime: `Intl.DurationFormat` n'est pas disponible partout. Bun l'a
	// (vérifié en 1.2.22), Node ne l'a pas avant la v23. Le Dockerfile lance l'app avec
	// Bun, donc le SSR passe; sur un hôte Node plus ancien l'appel lèverait un TypeError.
	function formatDuration(_start: Dayjs, _end: Dayjs) {
		return new Intl.DurationFormat('fr-ch').format({
			days: _end.diff(_start, 'days'),
			hours: _end.diff(_start, 'hours') % 24,
			minutes: _end.diff(_start, 'minutes') % 60,
		})
	}

	export function setPeriod(_period: PeriodProp) {
		period = _period
		start = daytz(period?.start || defaultStart)
		end = daytz(period?.end || defaultEnd)
		maxSubscribe = period?.maxSubscribe || 1
		selectedTeam = period?.team ?? null
		selectedTags = period?.tags ?? null
	}

	export function updatePeriodProp(updater: (p: PeriodProp) => PeriodProp) {
		period = updater(period || {})
	}

	async function createNextPeriod() {
		const duration = daytz(end).diff(start, 'minute')
		const teamId = selectedTeam?.id ?? period.teamId
		if (!teamId) return
		await duplicatePeriod({
			teamId,
			start: end.toDate(),
			end: end.add(duration, 'minute').toDate(),
			maxSubscribe,
			tagIds: (selectedTags ?? []).map((t) => t.id),
		})
		if (disableRedirect) await invalidateAll()
		else await goto(urlParam.without('form_period'), { invalidateAll: true, noScroll: true })
	}

	$effect.pre(() => {
		if (detectChange(period)) setPeriod(period)
	})

	function confirmDelete() {
		const nb = period.subscribes?.length || 0
		if (nb === 0) {
			ondelete?.()
			return true
		}
		const msg = [
			`Cette période de travail contient déjà ${nb} inscription${nb > 1 ? 's' : ''} !`,
			'Es-tu certain de vouloir la supprimer ?',
		].join('\n')
		if (confirm(msg)) {
			ondelete?.()
			return true
		}
		toast.info('Suppession de la période annulée !')
		return false
	}
</script>

<!-- `InputRelation`/`InputRelations` ne servent qu'à choisir: la valeur soumise est portée
     par les champs cachés ci-dessous, en ids clairs. -->
<form
	{...remoteForm.enhance(async ({ submit }) => {
		await submit()
		toast.success(period?.id ? 'Période mise à jour' : 'Période ajoutée')
		onsuccess?.()
	})}
	class="p-2 flex flex-col gap-3 {klass}"
>
	{#if period?.id}
		<input type="hidden" name="id" value={period.id} />
	{/if}

	{#if !disableRedirect}
		<input type="hidden" name="redirectTo" value={urlParam.without('form_period')} />
	{/if}

	<input type="hidden" name="team" value={selectedTeam?.id ?? ''} />
	{#each selectedTags ?? [] as tag (tag.id)}
		<input type="hidden" name="tags[]" value={tag.id} />
	{/each}

	{#key period}
		<InputRelation
			bind:value={selectedTeam}
			key="team_search"
			search={$api.team.search}
			slotItem={(item) => item.name}
			label="Secteur"
		/>
		<InputRelations
			bind:value={selectedTags}
			key="tags_search"
			search={$api.tag.search}
			slotItem={(tag) => component(TagSelectItem, { tag, is_editable: true })}
			slotSuggestion={(tag) => component(TagSelectItem, { tag })}
			label="Étiquettes"
			createUrl={urlParam.with({ form_tag: '{}' })}
			createTitle="Nouvelle étiquette"
		/>
	{/key}

	<label class="floating-label">
		<span>Nombre de bénévoles</span>
		<input
			class="input w-full"
			type="number"
			name="maxSubscribe"
			min="1"
			step="1"
			bind:value={maxSubscribe}
		/>
	</label>

	<div class="grid gap-3" style:grid-template-columns="repeat(2, minmax(80px, 1fr))">
		<InputDateTime
			label="Début"
			key="start"
			bind:value={start}
			onSetValue={(newStart) => {
				const duration = end.diff(start)
				end = newStart.add(duration)
				return newStart
			}}
		/>
		<InputDateTime
			label="Fin"
			key="end"
			bind:value={end}
			hint={formatDuration(start, end)}
			onSetValue={(newEnd) => {
				if (newEnd.isBefore(start) || newEnd.isSame(start)) {
					return newEnd.add(1, 'day')
				}
				return newEnd
			}}
		/>
	</div>

	{#each remoteForm.fields.allIssues() ?? [] as issue (issue.path.join('.') + issue.message)}
		<p class="text-error text-sm">{issue.message}</p>
	{/each}

	<div class="flex flex-row-reverse gap-3 grow">
		{#if period?.id}
			<button class="btn btn-primary" type="submit">Valider</button>
			<button
				type="button"
				class="btn btn-primary"
				class:btn-disabled={!start || !end}
				onclick={createNextPeriod}
			>
				<Icon path={mdiContentDuplicate} title="Dupliquer après" />
			</button>
			<div class="grow"></div>
		{:else}
			<button class="btn btn-primary" type="submit">Ajouter</button>
		{/if}
	</div>
</form>

{#if period?.id}
	<form
		{...deletePeriod.enhance(async ({ submit }) => {
			if (!confirmDelete()) return
			await submit()
			toast.success('Période supprimée')
		})}
		class="p-2 flex"
	>
		<input type="hidden" name="id" value={period.id} />
		{#if !disableRedirect}
			<input type="hidden" name="redirectTo" value={urlParam.without('form_period')} />
		{/if}
		<ButtonDelete formaction={deletePeriod.action} />
	</form>
{/if}
