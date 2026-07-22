<script lang="ts">
	import type { Event, EventTier, User } from '@prisma/client'
	import EmailLayout from './EmailLayout.svelte'
	import { domain } from '.'
	import { EVENT_TIER } from '$lib/constant'

	export let event: Event
	export let owner: User
	export let membersValided: number
	export let ratio: number
	export let threshold: 80 | 90 | 100
	export let tier: EventTier

	$: tierConfig = EVENT_TIER[tier]
	$: max = tierConfig.max
	$: isMaxReached = ratio >= 1
</script>

<EmailLayout eventId={event.id} title="Alerte quota bénévoles - {event.name}">
	<p>
		Salut {owner.firstName},<br />
		L'évènement <b>{event.name}</b> approche de la limite de son plan.
	</p>

	<div
		style="
			border: 1px solid #eaeaea;
			border-radius: 8px;
			padding: 16px;
			margin: 16px 0;
			background: #fafafa;
		"
	>
		<p style="margin: 0 0 8px 0; font-size: 14px;">Plan actif : <b>{tierConfig.label}</b></p>
		<p style="margin: 0 0 8px 0; font-size: 14px;">
			Bénévoles validés :
			<b>
				{membersValided}{#if max !== null} / {max}{/if}
			</b>
		</p>
		<p style="margin: 0; font-size: 24px; font-weight: bold; color: #0d3b66;">
			{Math.round(ratio * 100)} %
		</p>
		<p style="margin: 8px 0 0 0; font-size: 14px;">
			Seuil des {threshold} % {#if isMaxReached}dépassé{:else}atteint{/if}.
		</p>
	</div>

	{#if isMaxReached}
		<p>
			La limite de ton plan est atteinte. Les bénévoles peuvent toujours s'inscrire, mais certaines
			fonctionnalités de l'espace administrateur sont restreintes jusqu'à ce que tu passes à un plan
			supérieur.
		</p>
	{:else}
		<p>Pense à passer à un plan supérieur si tu prévois d'accueillir plus de bénévoles.</p>
	{/if}

	<p style="text-align: center; margin: 24px 0;">
		<a
			href="{domain}/{event.id}/admin/event"
			style="
				background: #0d3b66;
				color: #fff;
				padding: 12px 24px;
				border-radius: 6px;
				text-decoration: none;
				display: inline-block;
				font-weight: 600;
			"
		>
			Gérer l'évènement
		</a>
	</p>

	<p style="font-size: 12px; opacity: 0.7;">
		Tu peux aussi passer à un plan supérieur depuis la page de ton évènement.
	</p>
</EmailLayout>
