<script lang="ts">
	import { resolve } from '$app/paths'
	import { ArrowLeftIcon } from '@lucide/svelte'
	import { EventForm } from '$lib/event'
</script>

<div class="flex flex-col gap-6">
	<div class="flex items-center gap-3">
		<a href={resolve('/me/events')} class="btn btn-ghost btn-square btn-sm">
			<ArrowLeftIcon />
		</a>
		<h1 class="text-2xl font-bold text-base-content">Nouvel évènement</h1>
	</div>

	<EventForm />
</div>
