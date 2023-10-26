<script lang="ts">
	import type { Event, FieldValue, Field } from '@prisma/client'

	import SectionCollapse from '$lib/material/SectionCollapse.svelte'
	import MemberProfileForm from './MemberProfileForm.svelte'

	export let event: Event & { memberFields: Field[] }
	export let fieldsValue: FieldValue[]
	export let memberId = ''
</script>

<SectionCollapse value="profile-{event.id}">
	<h2 slot="title">
		Mon profil
		<a href="/{event.id}" class="link link-hover">
			{event.name}
		</a>
	</h2>

	<span slot="subtitle">
		Informations concernant spécifiquement l'événement <b>{event.name}</b>
	</span>

	<MemberProfileForm {event} {fieldsValue} {memberId} on:success />
</SectionCollapse>
