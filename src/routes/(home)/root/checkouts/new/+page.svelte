<script lang="ts">
	import { enhance } from '$app/forms'
	import { useForm } from '$lib/fuma'
	import { InputNumber, InputRelation, Card, InputText } from '$lib/fuma'

	import { api } from '$lib/api'
	import InputProduct from './InputProduct.svelte'
	import type { User } from '@prisma/client'

	const form = useForm()

	let owner: User | undefined = $state(undefined)
</script>

<Card class="max-w-2xl mx-auto">
	{#snippet title()}
		<h2  class="title">New checkout</h2>
	{/snippet}

	<form action="/root/checkouts/new" method="post" use:enhance={form.submit}>
		<InputText key="name" label="Name" value="Correction" />
		<InputRelation key="user" search={$api.rootUser.search} label="Owner" bind:value={owner}>
			{#snippet item({ item })}
					
					<span>{item?.firstName} {item?.lastName}</span>
					<span class="text-xs">{item?.email}</span>
				
					{/snippet}
			{#snippet suggestion({ item })}
					
					<div>
						<div>{item.firstName} {item.lastName}</div>
						<div class="text-xs">{item.email}</div>
					</div>
				
					{/snippet}
		</InputRelation>
		<div class="flex gap-4">
			<InputNumber key="amount" label="Amount" class="grow" hint="x 100" value={0} />
			<InputText key="currency" label="Currency" class="grow" value="CHF" />
		</div>

		<div class="flex gap-4 flex-wrap mt-4">
			<InputProduct />
		</div>

		<div class="flex justify-end mt-2">
			<button class="btn"> Valider </button>
		</div>
	</form>
</Card>
