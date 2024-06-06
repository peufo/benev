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
	import { isDragged } from './isDragged'

	export let team: Team
</script>

<a
	href={`${$eventPath}/admin/members?subscribes_teams=["${team.id}"]`}
	on:click|stopPropagation
	class="btn btn-square btn-sm btn-ghost opacity-0 group-hover:opacity-100"
	use:tip={{ content: 'Tous les membres du secteur', disable: $isDragged }}
>
	<Icon path={mdiAccountMultipleOutline} />
</a>
<a
	href={`${$eventPath}/admin/subscribes?teams=["${team.id}"]`}
	on:click|stopPropagation
	class="btn btn-square btn-sm btn-ghost opacity-0 group-hover:opacity-100"
	use:tip={{ content: 'Toutes les inscriptions du secteur', disable: $isDragged }}
>
	<Icon path={mdiClipboardTextMultipleOutline} size={20} />
</a>
<a
	href={`${$eventPath}/admin/plan?teams=["${team.id}"]`}
	on:click|stopPropagation
	class="btn btn-square btn-sm btn-ghost opacity-0 group-hover:opacity-100"
	use:tip={{ content: 'Voir le planning du secteur', disable: $isDragged }}
>
	<Icon path={mdiChartGantt} />
</a>

<button
	on:click|stopPropagation
	class="drag-button btn btn-square btn-sm btn-ghost opacity-0 group-hover:opacity-100"
	use:tip={{ content: 'Changer la position du secteur', disable: $isDragged }}
>
	<Icon path={mdiDrag} />
</button>

<a
	href={$urlParam.with({
		form_period: JSON.stringify({ team: { id: team.id, name: team.name } }),
	})}
	class="btn btn-square btn-sm"
	use:tip={{ content: 'Ajouter une période', disable: $isDragged }}
>
	<Icon path={mdiPlus} />
</a>

<a
	href={$urlParam.with({ form_team: team.id })}
	on:click|stopPropagation
	class="btn btn-square btn-sm"
	use:tip={{ content: 'Éditer ce secteur', disable: $isDragged }}
>
	<Icon path={mdiPencilOutline} />
</a>
