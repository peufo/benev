<script lang="ts">
	import { resolve } from '$app/paths'
	import { ArrowLeftIcon } from '@lucide/svelte'
	import { Placeholder } from '$lib/ui'
	import EventPastRow from './EventPastRow.svelte'

	let { data } = $props()

	// Les années servent de repères: un bénévole cherche «l'édition 2024», pas une date.
	// `data.past` arrive déjà trié du plus récent au plus ancien, donc une simple
	// accumulation suffit à obtenir des groupes dans le bon ordre.
	let byYear = $derived(
		data.past.reduce<{ year: string; members: typeof data.past }[]>((groups, member) => {
			const year = member.event.startDate?.getFullYear().toString() ?? 'Sans date'
			const last = groups.at(-1)
			if (last?.year === year) last.members.push(member)
			else groups.push({ year, members: [member] })
			return groups
		}, [])
	)
</script>

<div class="flex items-center gap-2">
	<a
		href={resolve('/me/events')}
		class="btn btn-square btn-ghost btn-sm"
		aria-label="Retour à mes évènements"
	>
		<ArrowLeftIcon size={18} />
	</a>
	<h1 class="title">Évènements terminés</h1>
</div>

{#if data.past.length}
	{#each byYear as { year, members } (year)}
		<section class="mt-5">
			<h2 class="title-sm px-2 tabular-nums sm:px-3">{year}</h2>
			<ul class="mt-1">
				{#each members as member (member.id)}
					<EventPastRow {member} />
				{/each}
			</ul>
		</section>
	{/each}
{:else}
	<div class="mt-4">
		<Placeholder>
			<p class="text-center">Aucun évènement terminé pour l'instant.</p>
		</Placeholder>
	</div>
{/if}
