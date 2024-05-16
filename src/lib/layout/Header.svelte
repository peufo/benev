<script lang="ts">
	import AuthIcon from '$lib/me/AuthIcon.svelte'
	import type { User } from '@prisma/client'

	export let user: User | undefined = undefined
	let klass = ''
	export { klass as class }
</script>

<div class="px-4 {klass}">
	<header class="navbar rounded-b-2xl bg-base-100 shadow-lg">
		<slot name="start" />
		<div class="grow" />
		<slot name="end" />
		<AuthIcon {user} />
	</header>
</div>
