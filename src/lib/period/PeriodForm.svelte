<script lang="ts">
	import { CopyIcon, PlusIcon } from '@lucide/svelte'
	import { daytz } from '$lib/dayjs'
	import {
		ButtonDelete,
		InputSelect,
		InputMultiSelect,
		tip,
		urlParam,
		InputNumber,
		InputDateTime,
	} from 'fuma'
	import type { Period, Subscribe, Tag, Team } from '@prisma/client'
	import { goto } from '$app/navigation'
	import { searchTeams } from '$lib/team/team.remote'
	import { searchTags } from '$lib/tag/tag.remote'
	import { TagSelectItem } from '$lib/tag'
	import { toast } from 'svelte-sonner'
	import { enhanceForm } from '$lib/enhanceForm'
	import { getEventTimeZone } from '$lib/timezone'
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
	const deleteFormId = $props.id()

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

	let defaultStart = daytz().startOf('hour').add(1, 'hour').toDate()
	let defaultEnd = daytz().startOf('hour').add(3, 'hours').toDate()
	let start = $state(period.start || defaultStart)
	let end = $state(period?.end || defaultEnd)

	let maxSubscribe = $state(period?.maxSubscribe || 1)
	let selectedTeam: Team | undefined = $state(period.team)
	let selectedTags: Tag[] = $state(period.tags ?? [])

	// ATTENTION runtime: `Intl.DurationFormat` n'est pas disponible partout. Bun l'a
	// (vérifié en 1.2.22), Node ne l'a pas avant la v23. Le Dockerfile lance l'app avec
	// Bun, donc le SSR passe; sur un hôte Node plus ancien l'appel lèverait un TypeError.
	function formatDuration(_start: Date, _end: Date) {
		const from = daytz(_start)
		const to = daytz(_end)
		return new Intl.DurationFormat('fr-ch').format({
			days: to.diff(from, 'days'),
			hours: to.diff(from, 'hours') % 24,
			minutes: to.diff(from, 'minutes') % 60,
		})
	}

	export function setPeriod(_period: PeriodProp) {
		period = _period
		start = period?.start || defaultStart
		end = period?.end || defaultEnd
		maxSubscribe = period?.maxSubscribe || 1
		// Le champ distant est la source de vérité une fois monté: sans ce `set`, la saisie
		// faite sur la période précédente resterait affichée en passant à la suivante.
		remoteForm.fields.maxSubscribe.set(maxSubscribe)
		selectedTeam = period?.team
		selectedTags = period?.tags ?? []
	}

	export function selectTag(tag: Tag) {
		if (selectedTags.some(({ id }) => id === tag.id)) return
		selectedTags = [...selectedTags, tag]
	}

	async function createNextPeriod() {
		const duration = daytz(end).diff(start, 'minute')
		const teamId = selectedTeam?.id ?? period.teamId
		if (!teamId) return
		const nextPeriod = await duplicatePeriod({
			teamId,
			start: end,
			end: daytz(end).add(duration, 'minute').toDate(),
			// `value()` suit la saisie en cours; il reste vide tant que le champ n'a pas été touché.
			maxSubscribe: remoteForm.fields.maxSubscribe.value() ?? maxSubscribe,
			tagIds: selectedTags.map((t) => t.id),
		})
		// La période créée devient celle du formulaire: `form_period` la recharge via le `load`,
		// ce qui permet d'enchaîner les duplications sans rouvrir le tiroir.
		await goto(urlParam.with({ form_period: nextPeriod.id }), {
			invalidateAll: true,
			noScroll: true,
			keepFocus: true,
		})
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

{#if period?.id}
	<!-- HTML interdit les <form> imbriqués: ce formulaire ne porte que les champs cachés, son
	bouton vit dans la barre d'actions du formulaire principal, associé par l'attribut `form`. -->
	<form
		{...deletePeriod.enhance(enhanceForm({ before: confirmDelete, success: 'Période supprimée' }))}
		id={deleteFormId}
		class="hidden"
	>
		<input type="hidden" name="id" value={period.id} />
		{#if !disableRedirect}
			<input type="hidden" name="redirectTo" value={urlParam.without('form_period')} />
		{/if}
	</form>
{/if}

<form
	{...remoteForm.enhance(
		enhanceForm({
			success: period?.id ? 'Période mise à jour' : 'Période ajoutée',
			onsuccess: () => onsuccess?.(),
		})
	)}
	class="flex flex-col gap-3 {klass}"
>
	{#if period?.id}
		<input type="hidden" name="id" value={period.id} />
	{/if}

	{#if !disableRedirect}
		<input type="hidden" name="redirectTo" value={urlParam.without('form_period')} />
	{/if}

	{#key period}
		<InputSelect
			field={remoteForm.fields.team}
			bind:value={selectedTeam}
			items={searchTeams}
			label="Secteur"
			class="w-full"
		>
			{#snippet selected(team)}
				<span>{team.name}</span>
			{/snippet}
			{#snippet proposal(team)}
				<span>{team.name}</span>
			{/snippet}
		</InputSelect>

		<InputMultiSelect
			field={remoteForm.fields.tags}
			bind:value={selectedTags}
			items={searchTags}
			label="Étiquettes"
		>
			{#snippet selected(tag)}
				<TagSelectItem {tag} is_editable />
			{/snippet}
			{#snippet proposal(tag)}
				<TagSelectItem {tag} />
			{/snippet}
			{#snippet append()}
				<a
					href={urlParam.with({ form_tag: '{}' })}
					class="btn btn-square btn-soft btn-sm"
					data-sveltekit-noscroll
					data-sveltekit-replacestate
					use:tip={{ content: 'Nouvelle étiquette' }}
				>
					<PlusIcon size={20} />
				</a>
			{/snippet}
		</InputMultiSelect>
	{/key}

	<InputNumber
		field={remoteForm.fields.maxSubscribe}
		label="Nombre de bénévoles"
		value={maxSubscribe}
		min={1}
		step={1}
	/>

	<div class="grid gap-3" style:grid-template-columns="repeat(2, minmax(80px, 1fr))">
		<InputDateTime
			label="Début"
			field={remoteForm.fields.start}
			bind:value={start}
			timezone={getEventTimeZone()}
			transform={(newStart) => {
				const duration = daytz(end).diff(start)
				end = daytz(newStart).add(duration).toDate()
				return newStart
			}}
		/>
		<InputDateTime
			label="Fin"
			field={remoteForm.fields.end}
			bind:value={end}
			timezone={getEventTimeZone()}
			hint={formatDuration(start, end)}
			transform={(newEnd) => {
				if (newEnd.getTime() <= start.getTime()) return daytz(newEnd).add(1, 'day').toDate()
				return newEnd
			}}
		/>
	</div>

	<div class="flex flex-col gap-1">
		{#each remoteForm.fields.allIssues() ?? [] as issue (issue.path.join('.') + issue.message)}
			<span class="text-error text-sm">{issue.message}</span>
		{/each}
	</div>

	<div class="flex flex-row-reverse gap-3 grow">
		{#if period?.id}
			<button class="btn btn-primary" type="submit">Valider</button>
			<button
				type="button"
				class="btn btn-soft btn-primary btn-square"
				class:btn-disabled={!start || !end}
				onclick={createNextPeriod}
				use:tip={{ content: 'Dupliquer après' }}
			>
				<CopyIcon size={18} />
			</button>
			<div class="grow"></div>
			<ButtonDelete form={deleteFormId} formaction={deletePeriod.action} />
		{:else}
			<button class="btn btn-primary" type="submit">Ajouter</button>
		{/if}
	</div>
</form>
