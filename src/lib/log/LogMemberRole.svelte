<script lang="ts">
	import type { LogTyped } from './logMap'
	import { snippetRef } from './Snippets.svelte'

	let { log }: { log: LogTyped<'member_role'> } = $props()

	let added = $derived(
		log.data.leaderOf?.after.filter((name) => !log.data.leaderOf?.before.includes(name)) ?? []
	)
	let removed = $derived(
		log.data.leaderOf?.before.filter((name) => !log.data.leaderOf?.after.includes(name)) ?? []
	)
</script>

<p>
	{@render snippetRef(log.data.actor)} a changé le rôle de {@render snippetRef(log.data.member)}
</p>

<div class="flex items-center flex-wrap gap-2 mt-1">
	{#if log.data.isAdmin}
		<span class="badge badge-sm {log.data.isAdmin.after.isAdmin ? 'badge-info' : 'badge-ghost'}">
			{log.data.isAdmin.after.isAdmin ? 'Administrateur' : "N'est plus administrateur"}
		</span>
	{/if}

	{#each added as name (name)}
		<span class="badge badge-sm badge-info badge-outline">Responsable de {name}</span>
	{/each}
	{#each removed as name (name)}
		<span class="badge badge-sm badge-ghost">Plus responsable de {name}</span>
	{/each}
</div>
