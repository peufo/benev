<script lang="ts">
	import Login from '$lib/me/Login.svelte'

	import type { User } from 'lucia'

	export let user: User | undefined
</script>

<main class="grow p-2">
	{#if !user}
		<Login />
	{:else}
		<div class="max-w-3xl m-auto flex flex-col gap-4">
			<slot />
		</div>
	{/if}
</main>
