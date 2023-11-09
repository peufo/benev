<script lang="ts">
	import AuthIcon from '$lib/me/AuthIcon.svelte'
	import { User } from '@prisma/client'

	export let user: User | undefined = undefined
</script>

<div class="p-2">
	<header class="navbar rounded-2xl bg-base-100 shadow-xl">
		<slot name="start" />
		<div class="grow" />
		<slot name="end" />
		<AuthIcon {user} />
	</header>
</div>
