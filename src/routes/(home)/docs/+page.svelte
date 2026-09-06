<script lang="ts">
	import { ClockIcon } from '@lucide/svelte'

	let { data } = $props()
</script>

<header class="px-2 pt-4 pb-2">
	<h1 class="text-3xl font-bold tracking-tight">Documentation</h1>
	<p class="text-base-content/70 mt-2">
		Tout ce qu'il faut pour monter ton évènement, ouvrir les inscriptions et suivre tes bénévoles.
	</p>
</header>

<!-- Une liste ordonnée: le rang affiché est celui de l'ordre de lecture, autant que le dire ici. -->
<ol class="grid gap-3 sm:grid-cols-2">
	{#each data.pages as docPage, index (docPage.slug)}
		<li class="min-w-0">
			<a
				href={docPage.path}
				class={[
					'flex h-full flex-col gap-1 rounded-lg p-4 sm:p-5',
					'bg-base-100 border-soft hover:border-hard border shadow transition-all hover:shadow-md',
				]}
			>
				<div class="flex items-center gap-2 text-sm">
					<span class="text-primary font-bold text-xl">{index + 1}.</span>
					<span class="title">{docPage.title}</span>
					<span class="text-base-content/70 ml-auto flex items-center gap-1.5 text-xs">
						<ClockIcon size={12} />
						{docPage.readingTime}&nbsp;min
					</span>
				</div>

				{#if docPage.description}
					<span class="text-base-content/70 text-sm">{docPage.description}</span>
				{/if}
			</a>
		</li>
	{/each}
</ol>
