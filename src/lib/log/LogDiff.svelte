<script lang="ts" generics="T extends object">
	import { ArrowRightIcon } from '@lucide/svelte'
	import type { LogUpdate } from './logTypes'
	import { snippetValue } from './Snippets.svelte'

	let {
		changes,
		labels,
		timezone,
	}: {
		changes: LogUpdate<T>
		/** Absent, la clé fait le libellé: les champs de profil sont indexés par leur nom. */
		labels?: Record<keyof T, string>
		timezone?: string
	} = $props()

	let keys = $derived(Object.keys(changes.after) as (keyof T)[])
</script>

{#each keys as key (key)}
	<div class="flex items-center flex-wrap gap-1 mt-1">
		<span class="badge badge-ghost badge-sm mr-1">{labels?.[key] ?? String(key)}</span>
		<span class="opacity-70">{@render snippetValue(changes.before[key], timezone)}</span>
		<ArrowRightIcon size={14} class="opacity-70" />
		{@render snippetValue(changes.after[key], timezone)}
	</div>
{/each}
