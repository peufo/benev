<script lang="ts">
	import AuthIcon from '$lib/me/AuthIcon.svelte'
	import type { User } from '@prisma/client'

	interface Props {
		user?: User | undefined
		start?: import('svelte').Snippet
		end?: import('svelte').Snippet
	}

	let { user = undefined, start, end }: Props = $props()
</script>

<div class="px-2 md:px-4">
	<header class={['flex p-2 rounded-b-xl bg-base-100 shadow-lg', 'border-soft border-b border-x']}>
		{@render start?.()}
		<div class="grow"></div>
		{@render end?.()}
		<AuthIcon {user} />
	</header>
</div>
