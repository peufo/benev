<script lang="ts">
	import AuthIcon from '$lib/me/AuthIcon.svelte'
	import { User } from '@prisma/client'

	export let user: User | undefined = undefined
</script>

<div class="p-2">
	<header class="navbar rounded-2xl bg-base-100 shadow-xl">
		<div class="gap-2">
			<slot name="start" />
		</div>
		<div class="grow" />
		<div class="gap-2">
			<slot name="end" />

			<AuthIcon {user} />
		</div>
	</header>
</div>
