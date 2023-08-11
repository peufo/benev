<script lang="ts">
	import Login from '$lib/me/Login.svelte'

	import type { User } from 'lucia'

	export let user: User | undefined
</script>

<main class="grow p-2">
	{#if !user}
		<Login />
	{:else}
		<div class="card bg-base-100 max-w-3xl m-auto">
			<div class="card-body">
				<slot />
			</div>
		</div>
	{/if}
</main>
