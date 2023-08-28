<script lang="ts">
	import type { Event, FieldValue, Field } from '@prisma/client'

	import { useForm } from '$lib/form'
	import { enhance } from '$app/forms'
	import MemberField from './MemberField.svelte'
	import Card from '$lib/material/Card.svelte'

	export let event: Event & { memberFields: Field[] }
	export let fieldsValue: FieldValue[]

	const form = useForm({
		successReset: false,
	})
</script>

<Card>
	<h2 slot="title">
		Mon profil
		<a href="/{event.id}" class="link link-hover">
			{event.name}
		</a>
	</h2>

	<form
		method="post"
		action="/{event.id}/me/profile"
		use:enhance={form.submit}
		class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4"
	>
		{#each event.memberFields as field (field.id)}
			{@const { value } = fieldsValue.find((value) => value.fieldId === field.id) || { value: '' }}
			<MemberField {field} {value} class="md:col-span-3" />
		{/each}

		<div class="flex justify-end md:col-span-12">
			<button class="btn">Sauvegarder </button>
		</div>
	</form>
</Card>
