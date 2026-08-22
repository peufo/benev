<script lang="ts">
	import type { LogTyped } from './logMap'
	import { snippetRef } from './Snippets.svelte'

	let { log }: { log: LogTyped<'member_role'> } = $props()
</script>

<p>
	{@render snippetRef(log.data.actor)} a changé le rôle de {@render snippetRef(log.data.member)}
</p>

<div class="mt-1">
	<span class="badge badge-sm {log.data.isAdmin.after.isAdmin ? 'badge-info' : 'badge-ghost'}">
		{log.data.isAdmin.after.isAdmin ? 'Administrateur' : "N'est plus administrateur"}
	</span>
</div>
