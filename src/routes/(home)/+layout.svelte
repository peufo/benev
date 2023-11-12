<script lang="ts">
	import logo from '$lib/assets/logo.svg'
	import Header from '$lib/Header.svelte'
	import Footer from '$lib/Footer.svelte'
	import Benev from '$lib/Benev.svelte'

	export let data
</script>

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
</Header>

<main class="grow p-2">
	<slot />
</main>

<Footer />
