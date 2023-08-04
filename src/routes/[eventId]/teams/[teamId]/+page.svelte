<script lang="ts">
	import { mdiPlus } from '@mdi/js'
	import { page } from '$app/stores'
	import { Icon } from '$lib/material'
	import PeriodForm from './PeriodForm.svelte'

	export let data

	const formater = new Intl.DateTimeFormat('fr-ch', {
		weekday: 'long',
		day: 'numeric',
		month: 'numeric',
		year: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
	})

	$: isOwner = data.event.ownerId === data.user?.userId
</script>

<div class="p-4 card bg-base-100 max-w-4xl m-auto">
	<div class="flex gap-2 py-2 items-center">
		<div>
			<h2 class="text-2xl">{data.team.name}</h2>
			<p>{data.team.description || ''}</p>
		</div>
		<div class="grow" />

	</div>
	<hr />

	<table class="table">
		<thead>
			<tr>
				<th>Période de travail</th>
				<th>Bénévoles</th>
			</tr>
		</thead>

		<tbody>
			{#each data.periods as period}
				<tr class="hover cursor-pointer relative">
					<td>{formater.formatRange(period.start, period.end)}</td>
					<td class="flex gap-2 items-center">
						<progress class="progress" value={1} max={period.maxSubscribe}/>
						<span class="whitespace-nowrap">1 / {period.maxSubscribe}</span>
						
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<div class="max-w-md m-auto mt-4 bg-base-100 rounded-lg">
	<PeriodForm />
</div>
