<script lang="ts">
	import { MoveVerticalIcon, PlusIcon, SearchIcon } from '@lucide/svelte'
	import { isHttpError } from '@sveltejs/kit'
	import { goto, invalidateAll } from '$app/navigation'
	import { page } from '$app/state'
	import { toast } from 'svelte-sonner'
	import { listEditable, tip, urlParam, useCommand } from 'fuma'
	import Progress from '$lib/Progress.svelte'
	import { Placeholder } from '$lib/ui'
	import { eventPath } from '$lib/eventPath'
	import { reorderTeams } from '$lib/team/team.remote'
	import type { LayoutData } from './$types'

	type TeamRow = LayoutData['teams'][number]

	interface Props {
		teams: TeamRow[]
		myTeamIds: string[]
	}

	let { teams, myTeamIds }: Props = $props()

	const isAdmin = $derived(!!page.data.member?.roles.includes('admin') || !!page.data.userIsRoot)

	let search = $state('')
	// Le curseur clavier ne se montre que tant que la recherche a le focus: `focusIndex` vaut 0
	// dès le montage, et surlignerait sinon la première ligne en permanence.
	let keyboard = $state(false)

	// Dérivé assignable: le glissé pose le nouvel ordre sans attendre le serveur, et le
	// rechargement des données du layout le reprend ensuite.
	let ordered = $derived(teams)

	const normalize = (value: string) =>
		value
			.toLowerCase()
			.normalize('NFD')
			.replace(/\p{Diacritic}/gu, '')

	// Toute la liste est déjà chargée: le filtre reste local, sans aller-retour ni rechargement
	// du volet de droite.
	const filtered = $derived.by(() => {
		const needle = normalize(search.trim())
		if (!needle) return ordered
		return ordered.filter((team) => normalize(team.name).includes(needle))
	})

	const mine = $derived(filtered.filter(({ id }) => myTeamIds.includes(id)))
	const others = $derived(filtered.filter(({ id }) => !myTeamIds.includes(id)))
	// Sans secteur à soi, ou sans secteur des autres, le partage en deux groupes ne distingue rien.
	const grouped = $derived(!!mine.length && !!others.length)
	// Les lignes affichées dans leur ordre de lecture, groupes compris: c'est le rang que
	// `command` indexe, et celui que les flèches parcourent.
	const rows = $derived([...mine, ...others])

	const command = useCommand({
		hotKey: 'k',
		onSelect: (index) => {
			const team = rows[index]
			if (team) goto(eventPath('/admin/teams/[teamId]', { teamId: team.id }))
		},
	})

	/**
	 * Une fois la page hydratée, `command` prend le clic en charge — c'est lui qui navigue et
	 * qui déplace le curseur clavier. Le `href` reste pour le rendu serveur, où aucun écouteur
	 * n'est encore posé.
	 *
	 * En capture, et sur le lien: la poignée de glissé arrête la propagation du clic qui suit
	 * le relâchement, ce qui suffit à museler `command` mais **pas** l'action par défaut du
	 * lien. Sans cette interception venue d'au-dessus, un simple glissé rechargerait la page.
	 */
	function interceptClick(event: MouseEvent) {
		event.preventDefault()
	}

	/**
	 * Le glissé ne réordonne que les lignes affichées: elles permutent entre les rangs qu'elles
	 * occupaient déjà, et les secteurs restés hors du groupe ou hors du filtre ne bougent pas.
	 */
	async function handleReorder(reordered: TeamRow[]) {
		const moved = new Set(reordered.map(({ id }) => id))
		const queue = [...reordered]
		const next = ordered.map((team) => (moved.has(team.id) ? queue.shift()! : team))
		ordered = next
		try {
			await reorderTeams(next.map(({ id }) => id))
			await invalidateAll()
			toast.success('Nouvel ordre sauvegardé')
		} catch (err) {
			console.error(err)
			toast.error(isHttpError(err) ? err.body.message : 'Réordonnancement impossible')
		}
	}
</script>

{#snippet row(team: TeamRow, index: number, isMine: boolean)}
	<a
		href={eventPath('/admin/teams/[teamId]', { teamId: team.id })}
		{...command.item(index)}
		onclickcapture={interceptClick}
		draggable="false"
		class={[
			'menu-item group select-none gap-2',
			page.params.teamId === team.id && 'active',
			keyboard && command.focusIndex === index && 'outline-2 outline-primary',
		]}
	>
		<span class="min-w-0 truncate text-sm" class:font-medium={isMine}>{team.name}</span>

		<Progress
			period={team}
			class={[
				'ml-auto min-w-0 w-16 shrink-0',
				isAdmin && 'pointer-fine:group-hover:w-8 pointer-fine:group-hover:invisible',
			]}
			badgeClass="ml-auto"
		/>
		{#if isAdmin}
			<span
				class={[
					'drag-button btn btn-sm btn-square btn-ghost',
					'absolute right-1 opacity-0 pointer-fine:group-hover:opacity-100',
					'pointer-coarse:static pointer-coarse:opacity-100',
				]}
			>
				<MoveVerticalIcon size={16} class="text-base-content/70" />
			</span>
		{/if}
	</a>
{/snippet}

{#snippet list(items: TeamRow[], offset: number, isMine: boolean)}
	<div
		class="flex flex-col"
		use:listEditable={{ items, onChange: handleReorder, dragElementsSelector: '.drag-button' }}
	>
		{#each items as team, index (team.id)}
			{@render row(team, offset + index, isMine)}
		{/each}
	</div>
{/snippet}

<div class="flex flex-col gap-2">
	<div
		class={[
			'flex gap-1 sticky top-0 z-10 -m-2 p-2 -translate-y-2',
			'bg-base-100/30 backdrop-blur-md',
		]}
	>
		<label class="input input-sm grow">
			<SearchIcon size={16} opacity={0.6} />
			<input
				bind:value={search}
				{...command.trigger}
				onfocus={() => (keyboard = true)}
				onblur={() => (keyboard = false)}
				type="search"
				placeholder="Recherche"
				aria-label="Rechercher un secteur"
				autocomplete="off"
			/>
		</label>

		{#if isAdmin}
			<a
				href={urlParam.with({ form_team: '{}' })}
				class="btn btn-sm btn-square btn-secondary"
				data-sveltekit-noscroll
				data-sveltekit-replacestate
				use:tip={{ content: 'Nouveau secteur' }}
			>
				<PlusIcon size={20} />
			</a>
		{/if}
	</div>

	{#if !rows.length}
		<Placeholder class="h-24">
			{search ? 'Aucun secteur trouvé' : 'Aucun secteur'}
		</Placeholder>
	{:else if grouped}
		<div class="flex flex-col">
			<span class="title-sm px-3 py-1">Mes secteurs</span>
			{@render list(mine, 0, true)}
		</div>
		<div class="flex flex-col">
			<span class="title-sm px-3 py-1">Autres secteurs</span>
			{@render list(others, mine.length, false)}
		</div>
	{:else}
		{@render list(rows, 0, !!mine.length)}
	{/if}
</div>
