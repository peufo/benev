<script lang="ts">
	import { CheckIcon, CircleAlertIcon } from '@lucide/svelte'
	import { tip } from 'fuma'
	import type { MemberWithComputedValues } from '$lib/server'

	interface Props {
		member: MemberWithComputedValues
	}

	let { member }: Props = $props()
</script>

{#if member.isValidedByUser}
	<div class="badge badge-success" use:tip={{ content: 'Le membre a validé sa participation' }}>
		<CheckIcon class="opacity-80 -translate-x-1" size={20} />
		Actif
	</div>
{:else}
	<div
		class="badge badge-warning"
		use:tip={{ content: `Le membre n'a pas validé sa participation` }}
	>
		<CircleAlertIcon class="opacity-80 -translate-x-1" size={20} />
		Inactif
	</div>
{/if}

{#if !member.isUserProfileCompleted || !member.isMemberProfileCompleted}
	{@const fields = [...member.userProfileRequiredFields, ...member.memberProfileRequiredFields]}
	<div
		class="badge badge-warning"
		use:tip={{ content: `Champs manquants: "${fields.join('", "')}"` }}
	>
		<CircleAlertIcon class="opacity-80 -translate-x-1" size={20} />
		Profil incomplet
	</div>
{/if}
