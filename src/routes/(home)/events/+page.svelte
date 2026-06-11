<script lang="ts">
	import { CardLink } from 'fuma'
	import { ArrowRight, CalendarX2 } from 'lucide-svelte'
	import logo from '$lib/assets/logo.svg'
	import { EventIcon } from '$lib/event/index.js'
	import { formatRangeDate } from '$lib/formatRange'

	export let data
</script>

<div class="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-20">
	<!-- Hero -->
	<section class="max-w-2xl mb-10 md:mb-14">
		<h1 class="text-4xl md:text-5xl font-extrabold text-primary tracking-tight leading-[1.05]">
			Événements à venir
		</h1>
		<p class="mt-4 text-lg md:text-xl text-base-content/70 leading-relaxed">
			Découvre les prochaines éditions gérées avec benevio et rejoins l'équipe de bénévoles.
		</p>
	</section>

	<!-- Liste -->
	{#if data.events.length}
		<ul class="grid md:grid-cols-2 gap-4">
			{#each data.events as event}
				<li>
					<CardLink href="/{event.id}" class="h-full group">
						<div class="flex gap-4">
							{#if event.posterId}
								<img
									src="/media/{event.posterId}?size=a6"
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
								</div>
								<p class="text-sm text-base-content/80 line-clamp-3 pr-2 grow">
									{event.description}
								</p>
								{#if event.startDate && event.endDate}
									<span class="text-sm text-base-content/60 italic mt-auto">
										{formatRangeDate(
											{ start: event.startDate, end: event.endDate },
											event.timezone
										)}
									</span>
								{/if}
							</div>
						</div>
					</CardLink>
				</li>
			{/each}
		</ul>
	{:else}
		<!-- État vide -->
		<div class="text-center py-20 md:py-28 bg-base-100 border border-base-200 rounded-2xl">
			<CalendarX2 size={48} class="mx-auto text-brand-beige mb-4" />
			<h2 class="text-2xl font-bold text-primary">Aucun événement à venir</h2>
			<p class="mt-2 text-base-content/70 max-w-md mx-auto">
				Il n'y a pas d'événement public pour le moment. Reviens plus tard ou crée le tien.
			</p>
			<a
				href="/me"
				class="btn btn-primary btn-lg gap-2 mt-6 shadow-lg hover:shadow-xl transition-shadow"
			>
				Organiser mon événement
				<ArrowRight size={18} />
			</a>
		</div>
	{/if}
</div>
