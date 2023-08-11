<script lang="ts">
	import AuthMenu from '$lib/me/AuthMenu.svelte'
	import logo from '$lib/assets/logo.svg'

	export let userName = ''
	export let pathPrefix = ''
</script>

<div class="p-2">
	<header class="navbar rounded-2xl bg-base-100 shadow-xl">
		<div class="gap-2">
			<a class="btn-ghost text-lg btn btn-square" href="/">
				<img src={logo} alt="logo benev" class="w-9 h-9" height="512" width="512">
			</a>
	
			<slot name="start" />
		</div>
		<div class="grow" />
		<div class="gap-2">
			<slot name="end" />
	
			<AuthMenu {pathPrefix} {userName} />
		</div>
	</header>
</div>
