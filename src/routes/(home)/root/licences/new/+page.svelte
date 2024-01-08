<script lang="ts">
	import { enhance } from '$app/forms'
	import { useForm } from '$lib/validation'
	import { InputNumber, InputRelation, InputRadio, Card } from '$lib/material'
	import { LICENCE_TYPE } from '$lib/constant'
	import { api } from '$lib/api'

	const form = useForm()
</script>

<Card class="max-w-md mx-auto">
	<h2 slot="title" class="title">New licence</h2>

	<form action="/root/licences/new" method="post" use:enhance={form.submit}>
		<InputRadio key="type" options={LICENCE_TYPE} label="Type" value="event" />
		<InputNumber key="quantity" label="Quantity" value="1" />
		<InputNumber key="price" value="0" label="Price" />
		<InputRelation key="ownerId" search={$api.user.search} label="Owner">
			<svelte:fragment slot="item" let:item>
				<span>{item?.firstName} {item?.lastName}</span>
				<span class="text-xs">{item?.email}</span>
			</svelte:fragment>
			<svelte:fragment slot="listItem" let:item>
				<div>
					<div>{item.firstName} {item.lastName}</div>
					<div class="text-xs">{item.email}</div>
				</div>
			</svelte:fragment>
		</InputRelation>

		<InputRadio key="licences.0.type" options={LICENCE_TYPE} />
		<InputNumber key="licences.0.quantity" />

		<InputRadio key="licences.1.type" options={LICENCE_TYPE} />
		<InputNumber key="licences.1.quantity" />

		<div class="flex justify-end mt-2">
			<button class="btn"> Valider </button>
		</div>
	</form>
</Card>
