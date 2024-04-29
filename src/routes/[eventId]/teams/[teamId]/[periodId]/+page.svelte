<script lang="ts">
	import { mdiChartGantt } from '@mdi/js'
	import Progress from '$lib/Progress.svelte'
	import { formatRange } from '$lib/formatRange'
	import { Card, Icon } from 'fuma'
	import { eventPath } from '$lib/store'
	import { SubscribeInviteForm, SubscribesOfPeriod } from '$lib/subscribe'
	import PeriodEditMenu from '$lib/PeriodEditMenu.svelte'

	export let data
</script>

<Card class="max-w-2xl m-auto" returnUrl="{$eventPath}/teams/{data.period.teamId}">
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

	<div class="flex flex-col gap-4 mt-6">
		<Progress period={data.period} withLabel />

		<SubscribesOfPeriod subscribes={data.period.subscribes} />
		<SubscribeInviteForm periodId={data.period.id} />
	</div>
</Card>
