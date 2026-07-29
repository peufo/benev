<script lang="ts">
	import { mdiLink } from '@mdi/js'
	import { Icon } from '$lib/fuma-legacy'
	import { InputRelation } from 'fuma'
	import { slide } from 'svelte/transition'
	import { useNotify } from '$lib/notify'
	import { searchOwnedEvents, useProductOnEvent } from './checkout.remote'

	interface Props {
		product: { id: string; name: string }
	}

	let { product }: Props = $props()

	const notify = useNotify()

	// Un formulaire par produit: `.for()` évite qu'ils partagent le même état.
	const form = $derived(useProductOnEvent.for(product.id))
	let hasSelection = $state(false)
</script>

<div class="flex flex-col gap-2">
	<p class="text-sm opacity-70">Ce produit n'est associé à aucun évènement.</p>

	<form
		{...form.enhance(async ({ submit }) => {
			await submit()
			notify.success('Produit associé')
		})}
		class="flex flex-col gap-2 w-full"
	>
		<input type="hidden" name="productId" value={product.id} />
		<InputRelation
			field={form.fields.eventId}
			searchItems={searchOwnedEvents}
			getValue={(event) => event.id}
			placeholder="Chercher un évènement"
			class="grow"
			onSelect={(event) => (hasSelection = !!event)}
		>
			{#snippet selected(event)}
				<span>{event.name} · {event.tier}</span>
			{/snippet}
			{#snippet proposal(event)}
				<span>{event.name} · {event.tier}</span>
			{/snippet}
		</InputRelation>
		{#if hasSelection}
			<div transition:slide class="ml-auto">
				<button type="submit" class="btn btn-sm btn-primary">
					<Icon path={mdiLink} size={16} />
					Associer
				</button>
			</div>
		{/if}
	</form>
</div>
