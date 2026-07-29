<script lang="ts">
	import { InputBoolean } from 'fuma'
	import MemberDeleteForm from './MemberDeleteForm.svelte'
	import type { MemberWithComputedValues } from '$lib/server'
	import { autoSubmit } from '$lib/action'
	import { useNotify } from '$lib/notify'
	import { updateMemberSettings } from './member.remote'

	interface Props {
		member: MemberWithComputedValues
	}

	let { member }: Props = $props()

	const notify = useNotify()
</script>

<h3 id="email-settings" class="title mb-4">Mes préférences</h3>

<form
	id="form_member_setting"
	{...updateMemberSettings.enhance(async ({ submit }) => {
		await submit()
		notify.success('Préférences sauvegardées')
	})}
	use:autoSubmit
>
	<InputBoolean
		field={updateMemberSettings.fields.isNotifiedSubscribe}
		checked={member.isNotifiedSubscribe}
		label="Être notifié quand mes inscriptions changent de statut"
	/>

	{#if member.roles.includes('leader')}
		<InputBoolean
			field={updateMemberSettings.fields.isNotifiedLeaderOfSubscribe}
			checked={member.isNotifiedLeaderOfSubscribe}
			label="Être notifié quand une inscription sous ma responsabilité change de statut"
		/>
	{/if}

	{#if member.roles.includes('admin')}
		<InputBoolean
			field={updateMemberSettings.fields.isNotifiedAdminOfNewMember}
			checked={member.isNotifiedAdminOfNewMember}
			label="Être notifié quand un nouveau membre rejoint l'événement"
		/>
	{/if}
</form>

<MemberDeleteForm memberId={member.id} class="w-max mt-2" />
