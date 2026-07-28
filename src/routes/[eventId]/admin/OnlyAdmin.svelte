<script lang="ts">
	import { page } from '$app/state'
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

{#if page.data.member?.roles.includes('admin') || page.data.userIsRoot}
	{@render children?.()}
{:else}
	<div class="grid place-content-center py-20">
		<p class="opacity-70">Tu dois être administrateur pour accéder à cette page</p>
	</div>
{/if}
