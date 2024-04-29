<script lang="ts">
	import { CardLink, Placeholder } from 'fuma'
	import logo from '$lib/assets/logo.svg'

	export let data
</script>

<div class="mx-auto max-w-xl pt-10">
	<div class="flex gap-2 items-center mb-4">
		<h2 class="text-xl font-semibold text-base-content/70">Évènements à venir</h2>
	</div>

	<ul class="flex flex-col gap-2 mt-2">
		{#each data.events as event}
			<CardLink href="/{event.id}">
				<div class="flex gap-4 items-start">
					{#if event.posterId}
						<img
							src="/media/{event.posterId}?size=a6"
							alt="Affiche de {event.name}"
							class="rounded border"
						/>
					{:else}
						<div
							style:width="105px"
							style:height="148px"
							class="bg-base-200/50 grid place-content-center rounded"
						>
							<img src={logo} alt="Affiche par défaut" class="w-16 grayscale opacity-50" />
						</div>
					{/if}

					<div>
						<div class="flex items-center gap-2 mt-2 mb-4">
							{#if event.icon}
								<img src={event.icon} alt="logo" class="h-6" />
							{/if}
							<span class="font-medium">{event.name}</span>
						</div>
						<p class="opacity-90 text-sm pr-2 pb-2">{event.description}</p>
					</div>
				</div>
			</CardLink>
		{:else}
			<Placeholder class="border">Aucun évènements</Placeholder>
		{/each}
	</ul>
</div>
