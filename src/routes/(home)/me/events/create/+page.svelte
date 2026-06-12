<script lang="ts">
	import { mdiArrowLeft } from '@mdi/js'
	import { Icon } from 'fuma'
	import { EventForm } from '$lib/event'
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-col gap-1">
		<div class="flex items-center gap-3">
			<a href="/me/events" class="btn btn-ghost btn-square btn-sm">
				<Icon path={mdiArrowLeft} />
			</a>
			<h1 class="text-2xl font-bold text-base-content">Nouvel évènement</h1>
		</div>
		<p class="text-base-content/60 ml-12">
			Renseigne les informations principales de ton évènement. Tu pourras compléter le reste une
			fois l'évènement créé.
		</p>
	</div>

	<EventForm />
</div>
