<script lang="ts">
	import { Icon, urlParam } from 'fuma'
	import {
		mdiAccountMultipleOutline,
		mdiChartGantt,
		mdiClipboardTextMultipleOutline,
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
	class="btn btn-square btn-sm btn-ghost opacity-0 group-hover:opacity-100"
>
	<Icon path={mdiAccountMultipleOutline} title="Tous les membres du secteur" />
</a>
<a
	href={`${$eventPath}/admin/subscribes?teams=["${team.id}"]`}
	on:click|stopPropagation
	class="btn btn-square btn-sm btn-ghost opacity-0 group-hover:opacity-100"
>
	<Icon
		path={mdiClipboardTextMultipleOutline}
		title="Toutes les inscriptions du secteur"
		size={20}
	/>
</a>
<a
	href={`${$eventPath}/admin/plan?teams=["${team.id}"]`}
	on:click|stopPropagation
	class="btn btn-square btn-sm btn-ghost opacity-0 group-hover:opacity-100"
>
	<Icon path={mdiChartGantt} title="Voir le planning du secteur" />
</a>

<a
	href={$urlParam.with({
		form_period: JSON.stringify({ team: { id: team.id, name: team.name } }),
	})}
	on:click|stopPropagation
	class="btn btn-square btn-sm"
>
	<Icon path={mdiPlus} title="Ajouter une période" />
</a>

<a
	href={$urlParam.with({ form_team: team.id })}
	on:click|stopPropagation
	class="btn btn-square btn-sm"
>
	<Icon path={mdiPencilOutline} title="Éditer ce secteur" />
</a>
