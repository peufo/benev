<script lang="ts">
	import { LinkIcon } from '@lucide/svelte'
	import { InputSelect } from 'fuma'
	import { slide } from 'svelte/transition'
	import { enhanceForm } from '$lib/enhanceForm'
	import { searchOwnedEvents, useProductOnEvent } from './checkout.remote'

	interface Props {
		product: { id: string }
	}

	let { product }: Props = $props()

	// Un formulaire par produit: `.for()` évite qu'ils partagent le même état.
	const form = $derived(useProductOnEvent.for(product.id))
	let hasSelection = $state(false)
</script>

<div class="flex flex-col gap-2">
	<p class="text-sm opacity-70">Ce produit n'est associé à aucun évènement.</p>

	<form
		{...form.enhance(enhanceForm({ success: 'Produit associé' }))}
		class="flex flex-col gap-2 w-full"
	>
		<input type="hidden" name="productId" value={product.id} />
		<InputSelect
			field={form.fields.eventId}
			items={searchOwnedEvents}
			getValue={(event) => event.id}
			placeholder="Chercher un évènement"
			class="w-full"
			onSelect={(event) => (hasSelection = !!event)}
		>
			{#snippet selected(event)}
				<span>{event.name} · {event.tier}</span>
			{/snippet}
			{#snippet proposal(event)}
				<span>{event.name} · {event.tier}</span>
			{/snippet}
		</InputSelect>
		{#if hasSelection}
			<div transition:slide class="ml-auto">
				<button type="submit" class="btn btn-sm btn-primary">
					<LinkIcon size={16} />
					Associer
				</button>
			</div>
		{/if}
	</form>
</div>
