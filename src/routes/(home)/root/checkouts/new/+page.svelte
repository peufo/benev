<script lang="ts">
	import { enhance } from '$app/forms'
	import { useForm } from 'fuma/validation'
	import { InputNumber, InputRelation, Card, InputText } from 'fuma'

	import { api } from '$lib/api'
	import InputsLicence from './InputsLicence.svelte'
	import type { User } from '@prisma/client'

	const form = useForm()

	let owner: User | undefined = undefined
</script>

<Card class="max-w-2xl mx-auto">
	<h2 slot="title" class="title">New checkout</h2>

	<form action="/root/checkouts/new" method="post" use:enhance={form.submit}>
		<InputText key="name" label="Name" value="Correction" />
		<InputRelation key="user" search={$api.rootUser.search} label="Owner" bind:value={owner}>
			<svelte:fragment slot="item" let:item>
				<span>{item?.firstName} {item?.lastName}</span>
				<span class="text-xs">{item?.email}</span>
			</svelte:fragment>
			<svelte:fragment slot="suggestion" let:item>
				<div>
					rootUser
					<div>{item.firstName} {item.lastName}</div>
					<div class="text-xs">{item.email}</div>
				</div>
			</svelte:fragment>
		</InputRelation>
		<div class="flex gap-4">
			<InputNumber key="amount" label="Amount" class="grow" hint="x 100" value={0} />
			<InputText key="currency" label="Currency" class="grow" value="CHF" />
		</div>

		<div class="flex gap-4 flex-wrap mt-4">
			<InputsLicence index={0} type="event" ownerId={owner?.id} />
			<InputsLicence index={1} type="member" ownerId={owner?.id} />
		</div>

		<div class="flex justify-end mt-2">
			<button class="btn"> Valider </button>
		</div>
	</form>
</Card>
