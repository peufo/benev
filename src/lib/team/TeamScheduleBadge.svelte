<script lang="ts">
	import type { TeamState } from '@prisma/client'
	import { ClockIcon } from '@lucide/svelte'
	import { daytz } from '$lib/dayjs'
	import { nextClose, type Scheduled } from './teamSchedule'

	interface Props {
		team: Scheduled & { state: TeamState }
		event: Scheduled & { selfSubscribeAllowed: boolean }
	}

	let { team, event }: Props = $props()

	const close = $derived(nextClose(team, event))
</script>

{#if close}
	<span class="badge">
		<ClockIcon size={16} />
		<span class="ml-1">Fin des inscriptions le {daytz(close).format('DD MMMM YYYY [à] HH:mm')}</span
		>
	</span>
{/if}
