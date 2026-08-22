<script lang="ts" module>
	import dayjs from '$lib/dayjs'
	import type { LogPeriod } from './logProject'
	import type { LogRef } from './logTypes'

	export { snippetPeriod, snippetRef, snippetValue, snippetBool }

	/**
	 * Le fuseau voyage en argument et non dans un module: un `$state` de module est partagé entre
	 * les requêtes au rendu serveur, et n'aurait de toute façon pas été posé — seul un `$effect`
	 * l'aurait écrit, ce qui ne s'exécute pas côté serveur. Il reste indéfini hors évènement,
	 * `/root/logs` n'en ayant aucun à nommer.
	 */
	function inZone(value: string, timezone: string | undefined) {
		const date = dayjs(value)
		return timezone ? date.tz(timezone) : date
	}

	const ISO_DATE = /^\d{4}-\d{2}-\d{2}T/
</script>

{#snippet snippetPeriod(period: LogPeriod, timezone?: string)}
	{@const start = inZone(period.start, timezone)}
	{@const end = inZone(period.end, timezone)}
	<span class="whitespace-nowrap"
		>{start.format('DD.MM.YYYY HH:mm')} – {end.isSame(start, 'day')
			? end.format('HH:mm')
			: end.format('DD.MM.YYYY HH:mm')}</span
	>
{/snippet}

{#snippet snippetRef(ref: LogRef | null)}
	{#if ref}<b>{ref.name}</b>{:else}<span class="opacity-70">—</span>{/if}
{/snippet}

{#snippet snippetBool(value: boolean)}<span>{value ? 'oui' : 'non'}</span>{/snippet}

{#snippet snippetValue(value: unknown, timezone?: string)}
	{#if value === null || value === undefined || value === ''}
		<span class="opacity-70">—</span>
	{:else if typeof value === 'boolean'}
		{@render snippetBool(value)}
	{:else if Array.isArray(value)}
		{#if value.length}<span>{value.join(', ')}</span>{:else}<span class="opacity-70">—</span>{/if}
	{:else if typeof value === 'string' && ISO_DATE.test(value)}
		<span class="whitespace-nowrap">{inZone(value, timezone).format('DD.MM.YYYY HH:mm')}</span>
	{:else}
		<span>{String(value)}</span>
	{/if}
{/snippet}
