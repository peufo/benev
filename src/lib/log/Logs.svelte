<script lang="ts">
	import { tick, type Snippet } from 'svelte'
	import { ChevronUpIcon } from '@lucide/svelte'
	import dayjs from '$lib/dayjs'
	import type { LogWithEvent } from './logTypes'
	import Log, { enterDuration } from './Log.svelte'
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
		/** Le fil occupe la hauteur qu'on lui donne: c'est à l'appelant de la borner. */
		class?: string
		before?: Snippet
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
		before,
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

	/**
	 * Tient une position de lecture le temps qu'une ligne s'ouvre. `in:slide` anime la hauteur: une
	 * correction posée une seule fois est juste à la première frame et fausse à toutes les suivantes.
	 */
	function holdScroll(place: (el: HTMLDivElement) => void, duration: number) {
		const el = container
		if (!el) return
		place(el)
		if (!duration) return
		const until = performance.now() + duration
		const frame = () => {
			place(el)
			if (performance.now() < until) requestAnimationFrame(frame)
		}
		requestAnimationFrame(frame)
	}

	/** L'entrée déjà en bas au dernier passage. Ce qui arrive après elle s'ouvre sous les yeux. */
	let newestSeen: string | undefined

	// Le fil se lit comme une conversation: on arrive à la fin. Sauf si le lecteur a chargé vers
	// le haut — c'est alors sa position qu'il faut préserver, pas la fin.
	$effect(() => {
		const newest = all.at(-1)?.id
		if (!newest || loaded.older.length) return
		// La fenêtre servie au montage est posée d'un coup: seule une entrée qui arrive ensuite
		// mérite qu'on suive son ouverture.
		const duration = newestSeen && newestSeen !== newest ? enterDuration() : 0
		newestSeen = newest
		holdScroll((el) => (el.scrollTop = el.scrollHeight), duration)
	})

	async function loadMore() {
		if (!loadPrevious || !oldestId || loading) return
		loading = true
		// Insérer au-dessus pousse tout vers le bas, mais la distance au bas du fil, elle, ne bouge
		// pas: c'est cet écart qu'on tient pour que le regard reste sur la ligne qu'il suivait.
		const fromBottom = container ? container.scrollHeight - container.scrollTop : 0
		try {
			const previous = await loadPrevious(oldestId)
			loaded = { older: [...previous.logs, ...loaded.older], more: previous.hasMore }
			await tick()
			holdScroll((el) => (el.scrollTop = el.scrollHeight - fromBottom), enterDuration())
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

<div class="flex flex-col grow min-h-0 border border-soft rounded-box {klass}">
	<div bind:this={container} class="flex flex-col gap-2 grow min-h-0 overflow-y-auto p-2">
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
				<p class="title-md">{title || ''}</p>
				<p class="text-sm text-base-content/70 mt-1">Début du journal</p>
			</div>
			{@render before?.()}
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
