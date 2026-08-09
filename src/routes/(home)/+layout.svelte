<script lang="ts">
	import logo from '$lib/assets/logo.svg'
	import { Header, Footer } from '$lib/layout'
	import Benev from '$lib/Benev.svelte'
	import HomeMenu from './HomeMenu.svelte'

	let { data, children } = $props()
</script>

<!-- Background gradient -->
<div class="absolute inset-0 bg-linear-to-b from-accent/10 via-accent/5 to-transparent -z-10"></div>

<Header user={data.user}>
	{#snippet start()}
		<a
			href="/"
			class={[
				'text-lg hover:bg-base-200 h-10 px-2 flex items-center gap-2 rounded-field',
				'whitespace-nowrap overflow-hidden text-ellipsis min-w-0',
			]}
		>
			<img src={logo} alt="logo benevio" class="w-8 h-8" height="512" width="512" />
			<Benev class="mx-2 text-2xl" />
		</a>
	{/snippet}

	{#snippet end()}
		<HomeMenu />
	{/snippet}
</Header>

<main class="grow p-2 sm:p-4 relative">
	{@render children?.()}
</main>

<Footer />
