<script lang="ts">
	import { page } from '$app/state'
	import EventTierSelector from './EventTierSelector.svelte'
	import { enhanceForm } from '$lib/enhanceForm'
	import { createEvent } from './event.remote'
	import SectionEssentiel from './settings/SectionEssentiel.svelte'

	interface Props {
		onsuccess?: () => void
	}

	let { onsuccess }: Props = $props()

	let plan = $state(page.url.searchParams.get('plan') || 'basic')
</script>

<form
	{...createEvent.enhance(enhanceForm({ onsuccess: () => onsuccess?.() }))}
	class="flex flex-col gap-6"
>
	<EventTierSelector bind:value={plan} />
	<SectionEssentiel fields={createEvent.fields} />
	<div class="flex gap-2 pt-4">
		<button class="btn btn-primary w-full">Créer mon évènement</button>
	</div>
</form>
