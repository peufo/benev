<script lang="ts">
	import { CheckIcon, GhostIcon, MessageCircleQuestionMarkIcon } from '@lucide/svelte'
	import { tip } from 'fuma'
	import type { MemberWithComputedValues } from '$lib/server'

	interface Props {
		member: MemberWithComputedValues
	}

	let { member }: Props = $props()
</script>

{#if member.isValidedByUser}
	<div
		class="badge badge-success badge-soft"
		use:tip={{ content: 'Le membre a validé sa participation' }}
	>
		<CheckIcon class="opacity-80 -translate-x-1" size={20} />
		Actif
	</div>
{:else}
	<div
		class="badge badge-info badge-soft badge-outline"
		use:tip={{ content: `Le membre n'a pas validé sa participation` }}
	>
		<GhostIcon class="opacity-80 -translate-x-1" size={20} />
		Inactif
	</div>
{/if}

{#if !member.isUserProfileCompleted || !member.isMemberProfileCompleted}
	<div
		class="badge badge-warning badge-soft badge-outline"
		use:tip={{ content: `Certaine informations de profile sont manquantes` }}
	>
		<MessageCircleQuestionMarkIcon class="opacity-80 -translate-x-1" size={20} />
		Incomplet
	</div>
{/if}
