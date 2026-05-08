<script lang="ts">
	import logo from '$lib/assets/logo.svg'
	import { Header, Footer } from '$lib/layout'
	import Benev from '$lib/Benev.svelte'
	import HomeMenu from './HomeMenu.svelte'

	export let data
</script>

<!-- Background gradient -->
<div
	class="absolute inset-0 bg-gradient-to-b from-brand-beige/10 via-brand-beige/5 to-transparent -z-10"
/>

<Header user={data.user}>
	<a
		slot="start"
		href="/"
		class="
			text-lg hover:bg-base-200 h-12 px-2 flex items-center gap-2 rounded-lg
			whitespace-nowrap overflow-hidden overflow-ellipsis min-w-0
		"
	>
		<img src={logo} alt="logo benev" class="w-9 h-9" height="512" width="512" />

		<Benev class="mx-2 text-2xl" />
	</a>

	<svelte:fragment slot="end">
		<HomeMenu />
	</svelte:fragment>
</Header>

<main class="grow p-2 sm:p-4 relative">
	<div
		class="absolute inset-0 bg-gradient-to-b from-brand-beige/10 via-brand-beige/5 to-transparent -z-10"
	/>
	<slot />
</main>

<Footer />
