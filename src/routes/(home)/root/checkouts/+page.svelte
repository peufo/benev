<script lang="ts">
	import { Card, Icon, Pagination } from '$lib/material'
	import { sumOfLicences } from '$lib/paywall/index.js'
	import { mdiPlus } from '@mdi/js'

	export let data
</script>

<Card>
	<div class="flex gap-2">
		<h2 class="title">Checkouts</h2>

		<a href="/root/checkouts/new" class="btn btn-square btn-sm ml-auto">
			<Icon path={mdiPlus} title="Créer des licences manuellement" />
		</a>
	</div>

	<table class="table">
		<thead>
			<tr>
				<td>User</td>
				<td>CreatedAt</td>
				<td>Amount</td>
				<td>Currency</td>
				<td>Licence event</td>
				<td>Licence member</td>
			</tr>
		</thead>
		<tbody>
			{#each data.checkouts as checkout}
				<tr>
					<td>
						<a href="/root/users/{checkout.user.id}" class="link link-hover">
							{checkout.user.firstName}
							{checkout.user.lastName}
						</a>
					</td>
					<td>
						{checkout.createdAt.toLocaleDateString()}
					</td>
					<td align="right">{(checkout.amount / 100).toFixed(2)}</td>
					<td>{checkout.currency}</td>
					<td align="right">{sumOfLicences(checkout.licences, 'event')}</td>
					<td align="right">{sumOfLicences(checkout.licences, 'member')}</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<div class="flex justify-end mt-2">
		<Pagination />
	</div>
</Card>
