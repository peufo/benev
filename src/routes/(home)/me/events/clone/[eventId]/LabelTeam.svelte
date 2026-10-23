<script lang="ts">
	import { formatRangeDateShort } from '#lib/formatRange.js'
	import { getRangeOfTeam } from '#lib/plan/index.js'
	import { getEventTimeZone } from '#lib/timezone.js'
	import { shiftDays } from '#lib/wallClock.js'
	import type { Period, Team } from '@prisma/client'

	interface Props {
		team: Team & { periods: Period[] }
		deltaDays: number
	}

	let { team, deltaDays }: Props = $props()

	const range = $derived(getRangeOfTeam(team))
	const shift = (date: Date) => shiftDays(date, deltaDays, getEventTimeZone())
</script>

<!-- Sans l'heure, qu'un décalage en jours ne touche pas; avec le jour de la semaine, qu'il
     déplace. `text-wrap` contre le `nowrap` que `.input` pose sur toute la ligne. -->
{#if range}
	<div class="flex flex-col items-end text-xs text-right text-wrap">
		<span class="opacity-50 line-through">{formatRangeDateShort(range)}</span>
		<span class="text-base-content/70">
			{formatRangeDateShort({
				start: shift(range.start),
				end: shift(range.end),
			})}
		</span>
	</div>
{/if}
