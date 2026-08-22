<script lang="ts">
	import { CheckIcon, GhostIcon, MessageCircleQuestionMarkIcon } from '@lucide/svelte'
	import { tip } from 'fuma'
	import type { MemberWithComputedValues } from '$lib/server'

	interface Props {
		member: MemberWithComputedValues
		hideLabel?: boolean
	}

	let { member, hideLabel }: Props = $props()
</script>

{#if member.isValidedByUser}
	<div
		class="badge badge-success badge-soft"
		use:tip={{ content: 'Le membre a validé sa participation' }}
	>
		<CheckIcon class={['opacity-80', !hideLabel && '-translate-x-1']} size={20} />
		{hideLabel ? '' : 'Actif'}
	</div>
{:else}
	<div
		class="badge badge-info badge-soft badge-outline"
		use:tip={{ content: `Le membre n'a pas validé sa participation` }}
	>
		<GhostIcon class={['opacity-80', !hideLabel && '-translate-x-1']} size={20} />
		{hideLabel ? '' : 'Inactif'}
	</div>
{/if}

{#if !member.isUserProfileCompleted || !member.isMemberProfileCompleted}
	<div
		class="badge badge-warning badge-soft badge-outline"
		use:tip={{ content: `Certaines informations de profil sont manquantes` }}
	>
		<MessageCircleQuestionMarkIcon
			class={['opacity-80', !hideLabel && '-translate-x-1']}
			size={20}
		/>
		{hideLabel ? '' : 'Incomplet'}
	</div>
{/if}
