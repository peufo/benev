<script lang="ts">
	import { InputBoolean } from 'fuma'
	import type { MemberWithComputedValues } from '#lib/server/index.js'
	import { autoSubmit } from '#lib/action/index.js'
	import { enhanceForm } from '#lib/enhanceForm.js'
	import { updateMemberSettings } from './member.remote'

	interface Props {
		member: MemberWithComputedValues
	}

	let { member }: Props = $props()
</script>

<form
	id="form_member_setting"
	{...updateMemberSettings.enhance(enhanceForm({ success: 'Préférences sauvegardées' }))}
	use:autoSubmit
	class="space-y-2"
>
	<InputBoolean
		field={updateMemberSettings.fields.isNotifiedSubscribe}
		checked={member.isNotifiedSubscribe}
		label="Être notifié quand mes inscriptions changent de statut"
		variant="switch"
	/>

	<InputBoolean
		field={updateMemberSettings.fields.isNotifiedReminder}
		checked={member.isNotifiedReminder}
		label="Recevoir un rappel avant chacun de mes créneaux"
		variant="switch"
	/>

	{#if member.roles.includes('leader')}
		<InputBoolean
			field={updateMemberSettings.fields.isNotifiedLeaderOfSubscribe}
			checked={member.isNotifiedLeaderOfSubscribe}
			label="Être notifié quand une inscription sous ma responsabilité change de statut"
			variant="switch"
		/>
	{/if}

	{#if member.roles.includes('admin')}
		<InputBoolean
			field={updateMemberSettings.fields.isNotifiedAdminOfNewMember}
			checked={member.isNotifiedAdminOfNewMember}
			label="Être notifié quand un nouveau membre rejoint l'événement"
			variant="switch"
		/>
	{/if}
</form>
