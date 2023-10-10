<script lang="ts">
	import AuthMenu from '$lib/me/AuthMenu.svelte'

	export let userName = ''
	export let pathPrefix = ''
</script>

<div class="p-2">
	<header class="navbar rounded-2xl bg-base-100 shadow-xl">
		<div class="gap-2">
			<slot name="start" />
		</div>
		<div class="grow" />
		<div class="gap-2">
			<slot name="end" />

			<AuthMenu {pathPrefix} {userName} />
		</div>
	</header>
</div>
