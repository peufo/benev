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

<div class="p-1">
	<header class={['flex p-1 bg-base-100 rounded-box', 'border border-soft']}>
		{@render start?.()}
		<div class="grow"></div>
		{@render end?.()}
		<AuthIcon {user} />
	</header>
</div>
