<script lang="ts">
	import { mdiPlus } from '@mdi/js'
	import { Card, Icon } from '$lib/material'
	import { eventPath } from '$lib/store'
	import Teams from '$lib/Teams.svelte'

	export let data
</script>

<Card class="max-w-4xl m-auto">
	<span slot="title">Secteurs</span>

	<a slot="action" href="{$eventPath}/teams/create" class="btn btn-sm">
		<Icon path={mdiPlus} />
		Nouveau
	</a>

	<Teams teams={data.teams} isOwner={data.isOwner} />
</Card>
