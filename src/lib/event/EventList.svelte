<script lang="ts">
	import { CardLink } from 'fuma'
	import { ArrowRight, CalendarX2 } from 'lucide-svelte'
	import logo from '$lib/assets/logo.svg'
	import { EventIcon } from '$lib/event/index.js'
	import { formatRangeDate } from '$lib/formatRange'
	import type { Event } from '@prisma/client'

	export let events: Event[]
	export let emptyTitle = 'Aucun événement'
	export let emptyDescription = ''
	export let emptyActionHref = '/me'
	export let emptyActionLabel = 'Organiser mon événement'
</script>

{#if events.length}
	<ul class="grid md:grid-cols-2 gap-4">
		{#each events as event}
			<li>
				<CardLink href="/{event.id}" class="h-full group">
					<div class="flex gap-4">
						{#if event.posterId}
							<img
								src="/media/{event.posterId}?size=a4"
								alt="Affiche de {event.name}"
								class="w-24 sm:w-28 md:w-32 aspect-[3/4] object-cover rounded-lg border border-base-200 shrink-0"
							/>
						{:else}
							<div
								class="w-24 sm:w-28 md:w-32 aspect-[3/4] bg-base-200/50 grid place-content-center rounded-lg border border-base-200 shrink-0"
							>
								<img
									src={logo}
									alt="Affiche par défaut"
									class="w-12 sm:w-16 grayscale opacity-50"
								/>
							</div>
						{/if}

						<div class="flex flex-col gap-2 min-w-0 py-1">
							<div class="flex items-center gap-2">
								{#if event.icon}
									<EventIcon icon={event.icon} class="h-5 w-5 text-primary shrink-0" />
								{/if}
								<h2 class="font-semibold text-primary truncate">{event.name}</h2>
								{#if event.state === 'archived'}
									<span class="badge ml-auto">Archivé</span>
								{/if}
							</div>
							<p class="text-sm text-base-content/80 line-clamp-3 pr-2 grow">
								{event.description}
							</p>
							{#if event.startDate && event.endDate}
								<span class="text-sm text-base-content/60 italic mt-auto">
									{formatRangeDate({ start: event.startDate, end: event.endDate }, event.timezone)}
								</span>
							{/if}
						</div>
					</div>
				</CardLink>
			</li>
		{/each}
	</ul>
{:else}
	<div class="text-center py-20 md:py-28 bg-base-100 border border-base-200 rounded-2xl">
		<CalendarX2 size={48} class="mx-auto text-brand-beige mb-4" />
		<h2 class="text-2xl font-bold text-primary">{emptyTitle}</h2>
		{#if emptyDescription}
			<p class="mt-2 text-base-content/70 max-w-md mx-auto">{emptyDescription}</p>
		{/if}
		<a
			href={emptyActionHref}
			class="btn btn-primary btn-lg gap-2 mt-6 shadow-lg hover:shadow-xl transition-shadow"
		>
			{emptyActionLabel}
			<ArrowRight size={18} />
		</a>
	</div>
{/if}
