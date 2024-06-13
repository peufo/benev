<script lang="ts">
	import { Icon, tip, urlParam } from 'fuma'
	import {
		mdiAccountMultipleOutline,
		mdiChartGantt,
		mdiClipboardTextMultipleOutline,
		mdiDrag,
		mdiPencilOutline,
		mdiPlus,
	} from '@mdi/js'
	import { eventPath } from '$lib/store'
	import type { Team } from '@prisma/client'

	export let team: Team
</script>

<a
	href={`${$eventPath}/admin/members?subscribes_teams=["${team.id}"]`}
	on:click|stopPropagation
	class="btn btn-square btn-sm btn-ghost scale-0 group-hover:scale-95 opacity-80"
	use:tip={{ content: 'Tous les membres du secteur' }}
>
	<Icon path={mdiAccountMultipleOutline} />
</a>
<a
	href={`${$eventPath}/admin/subscribes?teams=["${team.id}"]`}
	on:click|stopPropagation
	class="btn btn-square btn-sm btn-ghost scale-0 group-hover:scale-95 opacity-80"
	use:tip={{ content: 'Toutes les inscriptions du secteur' }}
>
	<Icon path={mdiClipboardTextMultipleOutline} size={20} />
</a>
<a
	href={`${$eventPath}/admin/plan?teams=["${team.id}"]`}
	on:click|stopPropagation
	class="btn btn-square btn-sm btn-ghost scale-0 group-hover:scale-95 opacity-80"
	use:tip={{ content: 'Voir le planning du secteur' }}
>
	<Icon path={mdiChartGantt} />
</a>

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
