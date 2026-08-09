<script lang="ts">
	import benevio from '$lib/assets/benevio.svg'
	import { Header, Footer } from '$lib/layout'
	import HomeMenu from './(home)/HomeMenu.svelte'
	import { page } from '$app/state'
</script>

<!-- Les metas d'erreur sont posées par le layout racine, qui reste monté ici -->

<Header user={page.data.user}>
	{#snippet start()}
		<a
			href="/"
			class={[
				'text-lg hover:bg-base-200 h-10 px-2 flex items-center gap-2 rounded-field',
				'whitespace-nowrap overflow-hidden text-ellipsis min-w-0',
			]}
		>
			<img src={benevio} alt="logo benevio" class="h-9" />
		</a>
	{/snippet}

	{#snippet end()}
		<HomeMenu />
	{/snippet}
</Header>

<main class="grow p-2 sm:p-4 grid place-content-center">
	<h3 class="text-xl">
		{page.status}
		{page.error?.message}
	</h3>
</main>

<Footer />
