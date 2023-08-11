<script lang="ts">
	import UserLayout from '$lib/me/AuthLayout.svelte'
	import Header from '$lib/Header.svelte'
	import Footer from '$lib/Footer.svelte'

	export let data
</script>


<Header userName={data.user?.name} />

<UserLayout user={data.user}>
	<slot />
</UserLayout>

<Footer />
