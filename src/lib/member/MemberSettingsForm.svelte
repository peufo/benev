<script lang="ts">
	import MemberDeleteForm from './MemberDeleteForm.svelte'
	import { InputBoolean, useForm } from 'fuma'
	import type { MemberWithComputedValues } from '$lib/server'
	import { autoSubmit } from '$lib/action'

	export let member: MemberWithComputedValues

	const { enhance } = useForm({ successReset: false, successMessage: 'Préférences sauvegardées' })
</script>

<h3 class="title mb-4">Mes préférences</h3>

<form
	id="form_member_setting"
	action="/{member.eventId}/me?/member_setting_update"
	method="post"
	use:enhance
	use:autoSubmit
>
	<InputBoolean
		key="isNotifiedSubscribe"
		value={member.isNotifiedSubscribe}
		label="Être notifié quand mes inscriptions changent de statut"
		labelPosition="right"
	/>

	{#if member.roles.includes('leader')}
		<InputBoolean
			key="isNotifiedLeaderOfSubscribe"
			value={member.isNotifiedLeaderOfSubscribe}
			label="Être notifié quand une inscription sous ma responsabilité change de statut"
			labelPosition="right"
		/>
	{/if}

	{#if member.roles.includes('admin')}
		<InputBoolean
			key="isNotifiedAdminOfNewMember"
			value={member.isNotifiedAdminOfNewMember}
			label="Être notifié quand un nouveau membre rejoint l'événement"
			labelPosition="right"
		/>
	{/if}
</form>

<MemberDeleteForm memberId={member.id} class="w-max mt-2" />
