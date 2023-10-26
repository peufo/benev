<script lang="ts">
	import { User } from '@prisma/client'
	import logo from '$lib/assets/logo.svg'
	import Header from '$lib/Header.svelte'
	import Footer from '$lib/Footer.svelte'

	export let user: User | undefined = undefined
</script>

<Header {user}>
	<a slot="start" class="btn-ghost text-lg btn btn-square" href="/">
		<img src={logo} alt="logo benev" class="w-9 h-9" height="512" width="512" />
	</a>
</Header>

<main class="grow p-2">
	<div class="max-w-3xl mx-auto flex flex-col gap-4">
		<slot />
	</div>
</main>

<Footer />
