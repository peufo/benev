<script lang="ts">
	import {  mdiHomeOutline } from '@mdi/js'
	import Icon from '$lib/material/Icon.svelte'
	import AuthMenu from '$lib/me/AuthMenu.svelte'

	export let userName = ''
	export let pathPrefix = ''
</script>

<div class="p-2">
	<header class="navbar rounded-2xl bg-base-100 shadow-xl">
		<div class="gap-2">
			<a class="btn-ghost text-lg btn btn-square lg:inline-flex lg:w-auto lg:px-2" href="/">
				<Icon path={mdiHomeOutline} class="lg:hidden" />
				<span class="hidden lg:inline-block">BENEV</span>
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
