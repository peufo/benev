<script lang="ts">
	import { EventList, EventsTabs } from '$lib/event/index.js'

	export let data
</script>

<div class="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-20">
	<!-- Hero -->
	<section class="max-w-2xl mb-6 md:mb-8">
		<h1 class="text-4xl md:text-5xl font-extrabold text-primary tracking-tight leading-[1.05]">
			Événements passés
		</h1>
		<p class="mt-4 text-lg md:text-xl text-base-content/70 leading-relaxed">
			Retrouve les éditions précédentes qui ont eu lieu avec benevio.
		</p>
	</section>

	<EventsTabs />

	<EventList
		events={data.events}
		emptyTitle="Aucun événement passé"
		emptyDescription="Il n'y a pas encore d'événement passé à afficher."
		emptyActionHref="/events"
		emptyActionLabel="Voir les événements à venir"
	/>
</div>
