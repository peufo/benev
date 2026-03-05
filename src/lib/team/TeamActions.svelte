<script lang="ts">
	import { Icon, tip, urlParam, useForm } from 'fuma'
	import {
		mdiAccountMultipleOutline,
		mdiChartGantt,
		mdiClipboardTextMultipleOutline,
		mdiPencilOutline,
		mdiPlus,
	} from '@mdi/js'
	import { eventPath } from '$lib/store'
	import type { Team } from '@prisma/client'
	import { CopyPlus } from 'lucide-svelte'
	import Delayed from './Delayed.svelte'

	export let team: Team
	const { enhance } = useForm()
</script>

<Delayed index={3} max={3}>
	<a
		href={`${$eventPath}/admin/members?subscribes_teams=["${team.id}"]`}
		on:click|stopPropagation
		class="btn btn-square btn-sm btn-ghost"
		use:tip={{ content: 'Tous les membres du secteur' }}
	>
		<Icon path={mdiAccountMultipleOutline} />
	</a>
</Delayed>

<Delayed index={2} max={3}>
	<a
		href={`${$eventPath}/admin/subscribes?teams=["${team.id}"]`}
		on:click|stopPropagation
		class="btn btn-square btn-sm btn-ghost"
		use:tip={{ content: 'Toutes les inscriptions du secteur' }}
	>
		<Icon path={mdiClipboardTextMultipleOutline} size={20} />
	</a>
</Delayed>

<Delayed index={1} max={3}>
	<a
		href={`${$eventPath}/admin/plan?teams=["${team.id}"]`}
		on:click|stopPropagation
		class="btn btn-square btn-sm btn-ghost"
		use:tip={{ content: 'Voir le planning du secteur' }}
	>
		<Icon path={mdiChartGantt} />
	</a>
</Delayed>

<Delayed index={0} max={3}>
	<form action="{$eventPath}/teams?/teams_clone" method="post" class="contents" use:enhance>
		<input type="hidden" name="id" value={team.id} />
		<button class="btn btn-square btn-sm btn-ghost" use:tip={{ content: 'Dupliquer le secteur' }}>
			<CopyPlus size="18" />
		</button>
	</form>
</Delayed>

<a
	href={$urlParam.with({
		form_period: JSON.stringify({ team: { id: team.id, name: team.name } }),
		section: team.id,
	})}
	class="btn btn-square btn-sm"
	use:tip={{ content: 'Ajouter une période' }}
	data-sveltekit-noscroll
	data-sveltekit-replacestate
>
	<Icon path={mdiPlus} />
</a>

<a
	href={$urlParam.with({ form_team: team.id, section: team.id })}
	class="btn btn-square btn-sm"
	use:tip={{ content: 'Éditer ce secteur' }}
	data-sveltekit-noscroll
	data-sveltekit-replacestate
>
	<Icon path={mdiPencilOutline} />
</a>
