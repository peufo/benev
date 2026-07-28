<script lang="ts">
	import { enhance } from '$app/forms'
	import { mdiLink } from '@mdi/js'
	import { Icon, InputRelation } from '$lib/fuma-legacy'
	import { useForm } from '$lib/fuma-legacy/validation'
	import { slide } from 'svelte/transition'

	interface Props {
		product: { id: string; name: string }
		action?: string
	}

	let { product, action = '?/use_product' }: Props = $props()

	const form = useForm({
		successMessage: 'Produit associé',
	})

	type EventSuggestion = { id: string; name: string; tier: string }

	let selectedEvent: EventSuggestion | null = $state(null)

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
