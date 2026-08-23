<script lang="ts">
	import { GhostIcon, MessageCircleQuestionMarkIcon } from '@lucide/svelte'
	import { tip } from 'fuma'
	import type { MemberWithComputedValues } from '$lib/server'

	interface Props {
		member: MemberWithComputedValues
		noBadge?: boolean
	}

	let { member, noBadge }: Props = $props()
</script>

{#if !member.userId}
	<div
		class={noBadge ? 'text-info' : 'badge badge-info badge-soft badge-outline'}
		use:tip={{
			content: member.email
				? `Aucun compte benevio n'est lié à ce membre : il ne peut ni consulter ses créneaux ni confirmer ses inscriptions.`
				: `Sans email, ce membre ne peut pas lier de compte benevio : il ne peut ni consulter ses créneaux ni confirmer ses inscriptions.`,
		}}
	>
		<GhostIcon class={['opacity-80', !noBadge && '-translate-x-1']} size={20} />
		{noBadge ? '' : 'Sans compte'}
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
