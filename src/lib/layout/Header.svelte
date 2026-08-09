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

<header class={['surface flex p-1 m-1']}>
	{@render start?.()}
	<div class="grow"></div>
	{@render end?.()}
	<AuthIcon {user} />
</header>
