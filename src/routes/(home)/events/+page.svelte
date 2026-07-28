<script lang="ts">
	import { EventList, EventsTabs } from '$lib/event/index.js'

	let { data } = $props()
</script>

<div class="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-20">
	<!-- Hero -->
	<section class="max-w-2xl mb-6 md:mb-8">
		<h1 class="text-4xl md:text-5xl font-extrabold text-primary tracking-tight leading-[1.05]">
			Événements à venir
		</h1>
		<p class="mt-4 text-lg md:text-xl text-base-content/70 leading-relaxed">
			Découvre les prochaines éditions gérées avec benevio et rejoins l'équipe de bénévoles.
		</p>
	</section>

	<EventsTabs />

	<EventList
		events={data.events}
		emptyTitle="Aucun événement à venir"
		emptyDescription="Il n'y a pas d'événement public à venir pour le moment. Reviens plus tard ou crée le tien."
		emptyActionHref="/me"
		emptyActionLabel="Organiser mon événement"
	/>
</div>
