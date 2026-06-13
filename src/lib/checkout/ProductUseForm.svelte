<script lang="ts">
	import { enhance } from '$app/forms'
	import { mdiLink } from '@mdi/js'
	import { Icon, InputRelation } from 'fuma'
	import { useForm } from 'fuma/validation'
	import { slide } from 'svelte/transition'

	export let product: { id: string; name: string }
	export let action = '?/use_product'

	const form = useForm({
		successMessage: 'Produit associé',
	})

	type EventSuggestion = { id: string; name: string; tier: string }

	let selectedEvent: EventSuggestion | null = null

	async function searchEvent(q: string) {
		const res = await fetch(`/me/events/search?q=${encodeURIComponent(q)}`)
		if (!res.ok) throw new Error('Erreur lors de la recherche')
		return res.json() as Promise<EventSuggestion[]>
	}
</script>

<div class="flex flex-col gap-2">
	<p class="text-sm opacity-70">Ce produit n'est associé à aucun évènement.</p>

	<form method="post" {action} class="flex flex-col gap-2 w-full" use:enhance={form.submit}>
		<input type="hidden" name="productId" value={product.id} />
		<InputRelation
			key="event"
			search={searchEvent}
			placeholder="Chercher un évènement"
			class="grow"
			bind:value={selectedEvent}
			slotItem={(event) => `${event.name} · ${event.tier}`}
			slotSuggestion={(event) => `${event.name} · ${event.tier}`}
		/>
		{#if selectedEvent}
			<div transition:slide class="ml-auto">
				<button type="submit" class="btn btn-sm btn-primary">
					<Icon path={mdiLink} size={16} />
					Associer
				</button>
			</div>
		{/if}
	</form>
</div>
