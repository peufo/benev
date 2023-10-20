<script lang="ts">
	import AuthMenu from '$lib/me/AuthMenu.svelte'
	import { Media, User } from '@prisma/client'

	export let user: (User & { avatar: Media | null }) | undefined = undefined
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

			<AuthMenu {pathPrefix} {user} />
		</div>
	</header>
</div>
