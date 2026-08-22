<script lang="ts">
	import type { SubscribeState } from '@prisma/client'
	import type { LogTyped } from './logMap'
	import { snippetPeriod, snippetRef } from './Snippets.svelte'

	type Types = 'subscribe_create' | 'subscribe_state' | 'subscribe_delete' | 'subscribe_absent'
	let { log, timezone }: { log: LogTyped<Types>; timezone?: string } = $props()

	const stateLabels: Record<SubscribeState, string> = {
		request: 'En demande',
		accepted: 'Acceptée',
		denied: 'Refusée',
		cancelled: 'Annulée',
	}
	const stateClass: Record<SubscribeState, string> = {
		request: 'badge-warning',
		accepted: 'badge-success',
		denied: 'badge-error',
		cancelled: 'badge-ghost',
	}
</script>

<p>
	{#if log.type === 'subscribe_create'}
		{@render snippetRef(log.data.actor)}
		{log.data.createdBy === 'user' ? "s'est inscrit·e" : 'a inscrit'}
		{#if log.data.createdBy === 'leader'}{@render snippetRef(log.data.member)}{/if}
		à {@render snippetRef(log.data.team)}
	{:else if log.type === 'subscribe_state'}
		{@render snippetRef(log.data.actor)} a changé l'inscription de
		{@render snippetRef(log.data.member)} à {@render snippetRef(log.data.team)}
	{:else if log.type === 'subscribe_delete'}
		{@render snippetRef(log.data.actor)} a supprimé l'inscription de
		{@render snippetRef(log.data.member)} à {@render snippetRef(log.data.team)}
	{:else}
		{@render snippetRef(log.data.actor)}
		{log.data.isAbsent ? 'a signalé' : "a levé l'absence de"}
		{@render snippetRef(log.data.member)}
		{#if log.data.isAbsent}absent·e{/if}
		sur {@render snippetRef(log.data.team)}
	{/if}
</p>

<div class="flex items-center flex-wrap gap-2 mt-1 text-base-content/70">
	{@render snippetPeriod(log.data.period, timezone)}

	{#if log.type === 'subscribe_state'}
		<span class="badge badge-sm {stateClass[log.data.before]} badge-outline">
			{stateLabels[log.data.before]}
		</span>
		<span aria-hidden="true">→</span>
		<span class="badge badge-sm {stateClass[log.data.after]}">{stateLabels[log.data.after]}</span>
	{:else if log.type === 'subscribe_create' || log.type === 'subscribe_delete'}
		<span class="badge badge-sm {stateClass[log.data.state]}">{stateLabels[log.data.state]}</span>
	{/if}

	{#if (log.type === 'subscribe_create' || log.type === 'subscribe_state') && log.data.isForced}
		<span
			class="badge badge-sm badge-ghost"
			title="Le membre n'a pas de compte: la validation ne pouvait pas lui être demandée"
		>
			validation forcée
		</span>
	{/if}
</div>
