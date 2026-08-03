<script lang="ts">
	import { Card } from '$lib/ui'
	import { InputNumber, InputSelect, InputString } from 'fuma'

	import InputProduct from './InputProduct.svelte'
	import { createCheckout, searchUsers } from './checkout.remote'
</script>

<Card class="max-w-2xl mx-auto">
	{#snippet title()}
		<h2 class="title">New checkout</h2>
	{/snippet}

	<form {...createCheckout} class="flex flex-col gap-4">
		<InputString field={createCheckout.fields.name} label="Name" value="Correction" />
		<InputSelect
			field={createCheckout.fields.user}
			items={searchUsers}
			getValue={(user) => user.id}
			label="Owner"
		>
			{#snippet selected(user)}
				<span>{user.firstName} {user.lastName}</span>
			{/snippet}
			{#snippet proposal(user)}
				<div>
					<div>{user.firstName} {user.lastName}</div>
					<div class="text-xs">{user.email}</div>
				</div>
			{/snippet}
		</InputSelect>
		<div class="flex gap-4">
			<InputNumber field={createCheckout.fields.amount} label="Amount" class="grow" value={0} />
			<InputString
				field={createCheckout.fields.currency}
				label="Currency"
				class="grow"
				value="CHF"
			/>
		</div>

		<div class="flex gap-4 flex-wrap mt-4">
			<InputProduct />
		</div>

		<div class="flex justify-end mt-2">
			<button class="btn"> Valider </button>
		</div>
	</form>
</Card>
