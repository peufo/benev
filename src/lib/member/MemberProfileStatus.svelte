<script lang="ts">
	import { tip } from '$lib/action'
	import { Icon } from 'fuma'
	import type { MemberWithComputedValues } from '$lib/server'
	import { mdiAlertCircleOutline } from '@mdi/js'

	export let member: MemberWithComputedValues
</script>

{#if !member.isUserProfileCompleted || !member.isMemberProfileCompleted}
	{@const fields = [...member.userProfileRequiredFields, ...member.memberProfileRequiredFields]}
	<div
		class="badge badge-warning"
		use:tip={{ content: `Champs manquants: "${fields.join('", "')}"` }}
	>
		<Icon path={mdiAlertCircleOutline} class="opacity-80 -translate-x-1" size={20} />
		Profil incomplet
	</div>
{/if}
