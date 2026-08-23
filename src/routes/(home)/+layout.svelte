<script lang="ts">
	import { resolve } from '$app/paths'
	import { page } from '$app/state'
	import benevio from '$lib/assets/benevio.svg'
	import { Header, Footer } from '$lib/layout'
	import HomeMenu from './HomeMenu.svelte'

	let { data, children } = $props()

	/**
	 * Le groupe `(home)` porte à la fois les pages publiques et l'espace connecté. Le pied de
	 * page complet s'adresse à qui évalue le produit ; sous ces routes, on est déjà entré.
	 */
	const APP_ROUTES = ['/(home)/me', '/(home)/root', '/(home)/auth', '/(home)/token']
	let footerVariant: 'public' | 'app' = $derived(
		APP_ROUTES.some((route) => page.route.id?.startsWith(route)) ? 'app' : 'public'
	)
</script>

<!-- Dégradé de page. `secondary` et non `accent`: l'orange est réservé au repérage temporel
     des plannings, et le vert rattache le fond au point du logo. -->
<div
	class="absolute inset-0 bg-linear-to-b from-secondary/10 via-secondary/5 to-transparent -z-10"
></div>

<Header user={data.user}>
	{#snippet start()}
		<a
			href={resolve('/')}
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

<main class="grow p-2 sm:p-4 relative">
	{@render children?.()}
</main>

<Footer variant={footerVariant} />
