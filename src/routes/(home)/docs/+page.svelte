<script lang="ts">
	let { data } = $props()
</script>

<header class="px-2 pt-4 pb-2">
	<h1 class="text-3xl font-bold tracking-tight">Documentation</h1>
	<p class="text-base-content/70 mt-2">
		Tout ce qu'il faut pour monter ton évènement, ouvrir les inscriptions et suivre tes bénévoles.
	</p>
</header>

{#each data.groups as group (group.label)}
	<section class="surface p-5">
		<h2 class="title mb-3">{group.label}</h2>
		<ul class="flex flex-col gap-1">
			{#each group.pages as docPage (docPage.slug)}
				<li>
					<a href={docPage.path} class="menu-item flex-col items-start gap-0.5 py-2">
						<span class="title-md">{docPage.label}</span>
						{#if docPage.description}
							<span class="text-base-content/70 text-sm whitespace-normal">
								{docPage.description}
							</span>
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	</section>
{/each}
