<script lang="ts">
	import AuthIcon from '$lib/me/AuthIcon.svelte'
	import type { User } from '@prisma/client'

	interface Props {
		user?: User | undefined
		class?: string
		style?: string
		start?: import('svelte').Snippet
		end?: import('svelte').Snippet
	}

	let { user = undefined, class: klass = '', style = '', start, end }: Props = $props()
</script>

<div class="px-2 sm:px-4 {klass}" {style}>
	<header class="navbar rounded-b-2xl bg-base-100 shadow-lg">
		{@render start?.()}
		<div class="grow"></div>
		{@render end?.()}
		<AuthIcon {user} />
	</header>
</div>
