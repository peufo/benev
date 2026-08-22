<script lang="ts">
	import { tick } from 'svelte'
	import { ChevronUpIcon } from '@lucide/svelte'
	import dayjs from '$lib/dayjs'
	import type { LogWithEvent } from './logTypes'
	import Log from './Log.svelte'
	import NoteForm from './NoteForm.svelte'

	interface Props {
		/** La fenêtre servie par le `load`, du plus ancien au plus récent. */
		logs: LogWithEvent[]
		/** Reste-t-il des entrées avant celles-ci ? */
		hasMore?: boolean
		/** Va chercher ce qui précède `beforeId`. Absent, le bouton n'est pas rendu. */
		loadPrevious?: (beforeId: string) => Promise<{ logs: LogWithEvent[]; hasMore: boolean }>
		/** Nommé dans l'accueil, en tête du fil. */
		title?: string
		/** Fuseau de l'évènement. Absent hors contexte d'évènement — `/root/logs` n'en a pas. */
		timezone?: string
		/** L'auteur d'une note, ou un admin, peut la retirer. */
		canDeleteNote?: (log: LogWithEvent) => boolean
		noteMemberId?: string
		showNoteForm?: boolean
		showEvent?: boolean
		class?: string
	}

	let {
		logs,
		hasMore = false,
		loadPrevious,
		title,
		timezone,
		canDeleteNote,
		noteMemberId,
		showNoteForm = false,
		showEvent = false,
		class: klass = '',
	}: Props = $props()

	let container = $state<HTMLDivElement>()
	let loading = $state(false)

	/**
	 * Ce que le bouton a ramené au-dessus de la fenêtre servie. `more: null` = rien chargé encore.
	 *
	 * Rien ne le remet à zéro ici: c'est la page qui enveloppe `Logs` dans un `{#key}` sur son
	 * filtre, et le composant repart neuf quand l'ensemble servi change.
	 */
	let loaded = $state<{ older: LogWithEvent[]; more: boolean | null }>({ older: [], more: null })

	let more = $derived(loaded.more ?? hasMore)
	let all = $derived([...loaded.older, ...logs])
	let oldestId = $derived(all[0]?.id)

	// Le fil se lit comme une conversation: on arrive à la fin. Sauf si le lecteur a chargé vers
	// le haut — c'est alors sa position qu'il faut préserver, pas la fin.
	$effect(() => {
		if (container && all.length && !loaded.older.length)
			container.scrollTop = container.scrollHeight
	})

	async function loadMore() {
		if (!loadPrevious || !oldestId || loading) return
		loading = true
		const heightBefore = container?.scrollHeight ?? 0
		try {
			const previous = await loadPrevious(oldestId)
			loaded = { older: [...previous.logs, ...loaded.older], more: previous.hasMore }
			await tick()
			// Insérer au-dessus pousse tout vers le bas: on rend la hauteur ajoutée au défilement
			// pour que le regard reste sur la ligne qu'il suivait.
			if (container) container.scrollTop += container.scrollHeight - heightBefore
		} finally {
			loading = false
		}
	}

	// `logs` est croissant et `reduce` garde l'ordre d'insertion: les jours le sont aussi.
	let days = $derived(
		Object.entries(
			all.reduce<Record<string, LogWithEvent[]>>((acc, log) => {
				const day = dayjs(log.createdAt).format('YYYY-MM-DD')
				;(acc[day] ??= []).push(log)
				return acc
			}, {})
		)
	)

	const intlDay = new Intl.DateTimeFormat('fr-CH', { dateStyle: 'full' })
</script>

<div class="flex flex-col border border-soft rounded-box {klass}">
	<div bind:this={container} class="flex flex-col gap-2 max-h-[60vh] overflow-y-auto p-2">
		{#if more}
			<button
				type="button"
				onclick={loadMore}
				disabled={loading}
				class="btn btn-sm w-max mx-auto my-2"
			>
				{#if loading}
					<span class="loading loading-spinner loading-xs"></span>
				{:else}
					<ChevronUpIcon size={18} />
				{/if}
				Charger les entrées précédentes
			</button>
		{:else}
			<div class="text-center px-4 py-8">
				<p class="title-md">Journal{title ? ` de ${title}` : ''}</p>
				<p class="text-sm text-base-content/70 mt-1">Vous êtes au début du journal</p>
			</div>
		{/if}

		{#each days as [day, dayLogs] (day)}
			<div class="divider text-xs text-base-content/70 my-0">
				{intlDay.format(new Date(day))}
			</div>
			<ul class="flex flex-col">
				{#each dayLogs as log (log.id)}
					<Log {log} {showEvent} {timezone} canDelete={canDeleteNote?.(log) ?? false} />
				{/each}
			</ul>
		{/each}
	</div>

	{#if showNoteForm}
		<div class="border-t border-soft p-2">
			<NoteForm memberId={noteMemberId} />
		</div>
	{/if}
</div>
