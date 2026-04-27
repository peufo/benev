<script lang="ts">
	import { CardBasic, Icon } from 'fuma'
	import AnimatedTitle from '$lib/AnimatedTitle.svelte'
	import { features } from '$lib/features'

	export let title = 'Les possibilités'
</script>

<section class="mt-8 mb-10 max-w-7xl mx-auto">
	<AnimatedTitle {title} />
	<div
		class="grid gap-4 items-start overflow-auto mt-14"
		style="grid-template-columns: repeat(auto-fill, minmax(min(20rem, 100%), 1fr)"
	>
		{#each features as feat}
			<CardBasic class="shadow p-5">
				<div class="flex flex-wrap gap-4 items-center">
					<Icon path={feat.icon} size={30} class="opacity-70 p-1 border rounded bg-base-200" />
					<h2 class="font-medium">
						{feat.name}
					</h2>
					<div class="grow" />
				</div>
				<p class="mt-3 opacity-80">
					{feat.description}
				</p>
				{#if feat.comingSoon}
					<span class="badge bg-base-200 mt-3">{feat.comingSoon}</span>
				{/if}
			</CardBasic>
		{/each}
	</div>
</section>
