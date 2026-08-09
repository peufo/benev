<script lang="ts">
	import { createBubbler, stopPropagation } from 'svelte/legacy'

	const bubble = createBubbler()
	import { tip } from 'fuma'
	import { urlParam } from 'fuma'
	import { eventPath } from '$lib/store'
	import type { Team } from '@prisma/client'
	import {
		ChartGanttIcon,
		ClipboardCopyIcon,
		PencilIcon,
		PlusIcon,
		UsersIcon,
	} from '@lucide/svelte'
	import Delayed from './Delayed.svelte'

	interface Props {
		team: Team
	}

	let { team }: Props = $props()
</script>

<Delayed index={2} max={2}>
	<a
		href={`${$eventPath}/admin/members?subscribes_teams=["${team.id}"]`}
		onclick={stopPropagation(bubble('click'))}
		class="btn btn-square btn-sm btn-ghost"
		use:tip={{ content: 'Tous les membres du secteur' }}
	>
		<UsersIcon />
	</a>
</Delayed>

<Delayed index={1} max={2}>
	<a
		href={`${$eventPath}/admin/subscribes?teams=["${team.id}"]`}
		onclick={stopPropagation(bubble('click'))}
		class="btn btn-square btn-sm btn-ghost"
		use:tip={{ content: 'Toutes les inscriptions du secteur' }}
	>
		<ClipboardCopyIcon size={20} />
	</a>
</Delayed>

<Delayed index={0} max={2}>
	<a
		href={`${$eventPath}/admin/plan?teams=["${team.id}"]`}
		onclick={stopPropagation(bubble('click'))}
		class="btn btn-square btn-sm btn-ghost"
		use:tip={{ content: 'Voir le planning du secteur' }}
	>
		<ChartGanttIcon />
	</a>
</Delayed>

<a
	href={urlParam.with({
		form_period: JSON.stringify({ team: { id: team.id, name: team.name } }),
		section: team.id,
	})}
	class="btn btn-square btn-sm btn-secondary btn-soft"
	use:tip={{ content: 'Ajouter une période' }}
	data-sveltekit-noscroll
	data-sveltekit-replacestate
>
	<PlusIcon />
</a>

<a
	href={urlParam.with({ form_team: team.id, section: team.id })}
	class="btn btn-square btn-sm btn-secondary"
	use:tip={{ content: 'Éditer ce secteur' }}
	data-sveltekit-noscroll
	data-sveltekit-replacestate
>
	<PencilIcon size={18} />
</a>
