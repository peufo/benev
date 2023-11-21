<script lang="ts">
	import { CardLink, Placeholder } from '$lib/material'

	export let data
</script>

<div class="mx-auto max-w-xl pt-10">
	<div class="flex gap-2 items-center mb-4">
		<h2 class="text-xl font-semibold text-base-content/70">Évènements à venir</h2>
	</div>

	<ul class="flex flex-col gap-2 mt-2">
		{#each data.events as event}
			<CardLink href="/{event.id}">
				<div class="flex items-center gap-2">
					{#if event.icon}
						<img src={event.icon} alt="logo" class="h-6" />
					{/if}
					<span class="font-medium mb-2">{event.name}</span>
				</div>
				<p class="opacity-70">{event.description}</p>
			</CardLink>
		{:else}
			<Placeholder class="border">Aucun évènements</Placeholder>
		{/each}
	</ul>
</div>
