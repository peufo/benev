<script lang="ts">
	import { formatRangeDateShort } from '$lib/formatRange'
	import { getRangeOfTeam } from '$lib/plan'
	import type { Period, Team } from '@prisma/client'

	interface Props {
		team: Team & { periods: Period[] }
		deltaDays: number
	}

	let { team, deltaDays }: Props = $props()

	const range = $derived(getRangeOfTeam(team))
	const DAY = 1000 * 60 * 60 * 24
</script>

<!-- Sans l'heure, qu'un décalage en jours ne touche pas; avec le jour de la semaine, qu'il
     déplace. `text-wrap` contre le `nowrap` que `.input` pose sur toute la ligne. -->
{#if range}
	<div class="flex flex-col items-end text-xs text-right text-wrap">
		<span class="opacity-50 line-through">{formatRangeDateShort(range)}</span>
		<span class="text-base-content/70">
			{formatRangeDateShort({
				start: range.start.getTime() + deltaDays * DAY,
				end: range.end.getTime() + deltaDays * DAY,
			})}
		</span>
	</div>
{/if}
