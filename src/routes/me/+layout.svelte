<script lang="ts">
	import UserLayout from '$lib/me/AuthLayout.svelte'
	import logo from '$lib/assets/logo.svg'
	import Header from '$lib/Header.svelte'
	import Footer from '$lib/Footer.svelte'

	export let data
</script>

<Header user={data.user}>
	<a slot="start" class="btn-ghost text-lg btn btn-square" href="/">
		<img src={logo} alt="logo benev" class="w-9 h-9" height="512" width="512" />
	</a>
</Header>

<UserLayout user={data.user}>
	<slot />
</UserLayout>

<Footer />
