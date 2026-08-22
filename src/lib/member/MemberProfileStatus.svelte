<script lang="ts">
	import { CheckIcon, GhostIcon, MessageCircleQuestionMarkIcon } from '@lucide/svelte'
	import { tip } from 'fuma'
	import type { MemberWithComputedValues } from '$lib/server'

	interface Props {
		member: MemberWithComputedValues
		noBadge?: boolean
	}

	let { member, noBadge }: Props = $props()
</script>

{#if member.isValidedByUser}
	<div
		class={noBadge ? 'text-success' : 'badge badge-success badge-soft badge-outline'}
		use:tip={{ content: 'Le membre a validé sa participation' }}
	>
		<CheckIcon class={['opacity-80', !noBadge && '-translate-x-1']} size={20} />
		{noBadge ? '' : 'Actif'}
	</div>
{:else}
	<div
		class={noBadge ? 'text-info' : 'badge badge-info badge-soft badge-outline'}
		use:tip={{ content: `Le membre n'a pas validé sa participation` }}
	>
		<GhostIcon class={['opacity-80', !noBadge && '-translate-x-1']} size={20} />
		{noBadge ? '' : 'Inactif'}
	</div>
{/if}

{#if !member.isUserProfileCompleted || !member.isMemberProfileCompleted}
	<div
		class={noBadge ? 'text-warning' : 'badge badge-warning badge-soft badge-outline'}
		use:tip={{ content: `Certaines informations de profil sont manquantes` }}
	>
		<MessageCircleQuestionMarkIcon class={['opacity-80', !noBadge && '-translate-x-1']} size={20} />
		{noBadge ? '' : 'Incomplet'}
	</div>
{/if}
