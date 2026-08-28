<script lang="ts">
	import type { LogTyped } from './logMap'
	import { snippetRef } from './Snippets.svelte'

	type Types = 'member_invite' | 'member_join' | 'member_delete' | 'member_validated'
	let { log }: { log: LogTyped<Types> } = $props()
</script>

<p>
	{#if log.type === 'member_invite'}
		{@render snippetRef(log.data.actor)}
		{log.data.resent ? 'a renvoyé une invitation à' : 'a invité'}
		{@render snippetRef(log.data.member)}
	{:else if log.type === 'member_join'}
		{@render snippetRef(log.data.member)}
		{log.data.wasInvited ? "a accepté l'invitation" : "a rejoint l'évènement"}
	{:else if log.type === 'member_delete'}
		{#if log.data.isSelf}
			{@render snippetRef(log.data.member)} a quitté l'évènement
		{:else}
			{@render snippetRef(log.data.actor)} a retiré {@render snippetRef(log.data.member)}
		{/if}
	{:else}
		{@render snippetRef(log.data.actor)}
		{log.data.isValidedByEvent ? 'a approuvé' : "a retiré l'approbation de"}
		{@render snippetRef(log.data.member)}
	{/if}
</p>

<div class="flex items-center flex-wrap gap-2 mt-1 text-base-content/70">
	{#if log.type === 'member_invite'}
		{#if log.data.email}
			<span>{log.data.email}</span>
		{:else}
			<span class="badge badge-sm badge-ghost">sans adresse email</span>
		{/if}
		{#if log.data.email && !log.data.sendEmail}
			<span class="badge badge-sm badge-warning badge-outline">aucun email envoyé</span>
		{/if}
		{#if log.data.isAdmin}
			<span class="badge badge-sm badge-ghost">administrateur.ice</span>
		{/if}
		{#if log.data.teams?.length}
			<span>responsable de</span>
			{#each log.data.teams as team (team.id)}
				<span class="badge badge-sm badge-ghost">{team.name}</span>
			{/each}
		{/if}
	{:else if log.type === 'member_join' && !log.data.isValidedByEvent}
		<span class="badge badge-sm badge-warning badge-outline">en attente d'approbation</span>
	{/if}
</div>
