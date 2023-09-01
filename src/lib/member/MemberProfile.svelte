<script lang="ts">
	import type { Event, FieldValue, Field } from '@prisma/client'

	import Card from '$lib/material/Card.svelte'
	import MemberProfileForm from './MemberProfileForm.svelte'

	export let event: Event & { memberFields: Field[] }
	export let fieldsValue: FieldValue[]
	export let memberId = ''
</script>

<Card>
	<h2 slot="title" id="member-profile-{event.id}">
		Mon profil
		<a href="/{event.id}" class="link link-hover">
			{event.name}
		</a>
	</h2>

	<MemberProfileForm {event} {fieldsValue} {memberId} on:success />
</Card>
