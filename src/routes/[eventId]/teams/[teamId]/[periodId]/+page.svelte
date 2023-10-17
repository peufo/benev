<script lang="ts">
	import { mdiChartGantt } from '@mdi/js'
	import InviteSubscribeForm from '$lib/InviteSubscribeForm.svelte'
	import Progress from '$lib/Progress.svelte'
	import { formatRange } from '$lib/formatRange.js'
	import { Card, Icon } from '$lib/material'
	import { eventPath } from '$lib/store'
	import PeriodSubscribes from '$lib/PeriodSubscribes.svelte'
	import PeriodEditMenu from '$lib/PeriodEditMenu.svelte'

	export let data
</script>

<Card class="max-w-4xl m-auto" returnUrl="{$eventPath}/teams/{data.period.teamId}">
	<h2 slot="title">
		{data.period.team.name}<br />
		{formatRange(data.period)}
	</h2>
	<div slot="action" class="flex gap-2">
		<a class="btn btn-square btn-sm" href="{$eventPath}/admin/plan#{data.period.id}">
			<Icon path={mdiChartGantt} size={20} title="Voir cette période sur le planning" />
		</a>

		<PeriodEditMenu period={data.period} />
	</div>

	<div class="grid gap-4 grid-cols-1 md:grid-cols-2 mt-4">
		<div>
			<Progress period={data.period} withLabel />
		</div>
		<div class="flex flex-col gap-2">
			<PeriodSubscribes subscribes={data.period.subscribes} />
			<InviteSubscribeForm periodId={data.period.id} />
		</div>
	</div>
</Card>
