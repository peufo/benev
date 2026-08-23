<script lang="ts">
	import { resolve } from '$app/paths'
	import { PlusIcon } from '@lucide/svelte'
	import { Card } from '$lib/ui'
	import { Pagination, tip } from 'fuma'

	let { data } = $props()
</script>

<Card>
	<div class="flex gap-2">
		<h2 class="title">Checkouts</h2>

		<a href={resolve('/root/checkouts/new')} class="btn btn-square btn-sm ml-auto">
			<span class="inline-flex" use:tip={{ content: 'Créer un checkout manuellement' }}
				><PlusIcon /></span
			>
		</a>
	</div>

	<table class="table">
		<thead>
			<tr>
				<th>User</th>
				<th>Name</th>
				<th>CreatedAt</th>
				<th>Amount</th>
				<th>Currency</th>
				<th>Products</th>
			</tr>
		</thead>
		<tbody>
			{#each data.checkouts as checkout (checkout.id)}
				<tr>
					<td>
						<a
							href={resolve('/(home)/root/users/[userId]', { userId: checkout.user.id })}
							class="link link-hover"
						>
							{checkout.user.firstName}
							{checkout.user.lastName}
						</a>
					</td>
					<td>
						{checkout.name ?? '-'}
					</td>
					<td>
						{checkout.createdAt.toLocaleDateString()}
					</td>
					<td align="right">{(checkout.amount / 100).toFixed(2)}</td>
					<td>{checkout.currency}</td>
					<td align="right">{checkout.products.length}</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<div class="flex justify-end mt-2">
		<Pagination />
	</div>
</Card>
