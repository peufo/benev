<script lang="ts">
	import { ArrowLeftIcon, SearchIcon } from '@lucide/svelte'
	import { onMount, tick } from 'svelte'
	import { fly } from 'svelte/transition'
	import type { Period } from '@prisma/client'

	import { SelectorList } from '$lib/ui'
	import { Dialog } from 'fuma'
	import { searchAvailableTeams } from '$lib/team/team.remote'
	import { createSubscribe } from '$lib/subscribe/subscribe.remote'
	import { enhanceForm } from '$lib/enhanceForm'
	import { formatRange } from '$lib/formatRange'
	import Progress from '$lib/Progress.svelte'
	import { on } from 'svelte/events'

	interface Props {
		dialog: HTMLDialogElement
		memberId: string
		title?: string
	}

	let { dialog = $bindable(), memberId, title = 'Nouvelle inscription' }: Props = $props()

	let search = $state('')
	let searchInput: HTMLInputElement = $state()!
	const teamsQuery = $derived(searchAvailableTeams({ search }))
	const teams = $derived(teamsQuery.current ?? [])

	type Team = (typeof teams)[number]

	// Le secteur choisi est retenu par son id, pas par l'objet: les périodes affichées suivent
	// ainsi les rafraîchissements de la requête au lieu de figer l'instantané du moment du clic.
	let selectedTeamId: string | null = $state(null)
	const selectedTeam = $derived(teams.find(({ id }) => id === selectedTeamId) ?? null)
	let selectedPeriod: Period | null = $state(null)
	let offsetWidth: number = $state()!

	let submitButton: HTMLButtonElement = $state()!

	async function handleClickReturn() {
		selectedTeamId = null
		search = ''
		await tick()
		searchInput.focus()
	}
	function handleSelectTeam(team: Team) {
		setTimeout(async () => {
			selectedTeamId = team.id
			await tick()
			dialog.focus()
		}, 0)
	}

	async function onSelect(periodIndex: number) {
		if (!selectedTeam) return
		selectedPeriod = selectedTeam.periods.filter((p) => p.isAvailable)[periodIndex]
		await tick()
		submitButton.click()
	}

	/**
	 * Une inscription rend les places qu'elle occupe indisponibles. Le dialogue repart donc de la
	 * recherche, et redemande les secteurs: la fermeture prépare l'ouverture suivante, qui sert
	 * le plus souvent à inscrire un autre membre.
	 */
	async function handleClose() {
		selectedTeamId = null
		selectedPeriod = null
		search = ''
		await tick()
		await teamsQuery.refresh()
	}

	onMount(() => {
		const returnKey = (event: KeyboardEvent) =>
			event.key === 'Backspace' && selectedTeamId && handleClickReturn()
		return on(dialog, 'keydown', returnKey)
	})
</script>

<Dialog bind:dialog onClose={handleClose} class="overflow-x-hidden">
	{#snippet header()}
		<h2 class="title" bind:offsetWidth>{title}</h2>
	{/snippet}
	{#if !selectedTeam}
		<div class="content" in:fly={{ x: -offsetWidth, duration: 250 }}>
			<label class="input w-full">
				<SearchIcon size={20} opacity={0.6} />
				<input
					bind:this={searchInput}
					bind:value={search}
					type="search"
					placeholder="Chercher un secteur"
					autocomplete="off"
				/>
			</label>

			<SelectorList
				trigger={searchInput}
				items={teams}
				isLoading={teamsQuery.loading}
				isError={!!teamsQuery.error}
				class="w-full max-h-80 mt-2 overflow-y-auto relative"
				onSelect={(index) => handleSelectTeam(teams[index])}
			>
				{#snippet children({ item })}
					<span>{item.name}</span>
					<Progress
						class="ml-auto"
						period={{
							maxSubscribe: item.maxSubscribes,
							subscribes: item.periods.map((p) => p.subscribes).flat(),
						}}
					/>
				{/snippet}
			</SelectorList>
		</div>
	{:else}
		<form
			in:fly={{ x: offsetWidth, duration: 250 }}
			{...createSubscribe.enhance(
				enhanceForm({ success: 'Inscription créée', onsuccess: () => dialog.close() })
			)}
		>
			<div class="flex gap-2 items-center">
				<button type="button" class="btn btn-square btn-ghost btn-sm" onclick={handleClickReturn}>
					<ArrowLeftIcon />
				</button>
				<h3 class="title text-lg">{selectedTeam.name}</h3>
			</div>

			<SelectorList
				trigger={dialog}
				items={selectedTeam.periods.filter((p) => p.isAvailable)}
				class="w-full max-h-80 mt-2 overflow-y-auto relative"
				{onSelect}
			>
				{#snippet children({ item })}
					<span>{formatRange(item)}</span>
					<Progress period={item} class="ml-auto" />
				{/snippet}
			</SelectorList>
			<input type="hidden" name="memberId" value={memberId} />
			<input type="hidden" name="periodId" value={selectedPeriod?.id} />
			<button type="submit" bind:this={submitButton} class="hidden">submit</button>
		</form>
	{/if}
</Dialog>
