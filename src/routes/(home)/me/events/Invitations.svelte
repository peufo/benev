<script lang="ts">
	import { MailWarningIcon } from '@lucide/svelte'
	import type { PageData } from './$types'
	import { EmailVerificationButton } from '$lib/me'
	import { resolve } from '$app/paths'

	let { data }: { data: PageData } = $props()

	const invitationDateFormater = new Intl.DateTimeFormat('fr-ch', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	})
</script>

{#if data.invitations.length}
	<section class="p-3 space-y-3">
		<h2 class="title-sm uppercase">
			Invitation{data.invitations.length > 1 ? 's' : ''} en attente
		</h2>

		{#if data.emailToVerify}
			<div
				class={[
					'flex flex-wrap items-center justify-between gap-x-3 gap-y-2 p-3',
					'border border-soft rounded-box',
				]}
			>
				<p class="flex min-w-0 items-center gap-2 text-sm">
					<MailWarningIcon size={18} class="shrink-0 text-warning" />
					<span>
						Tu dois valider ton adresse email pour consulter
						{data.invitations.length > 1 ? 'ces invitations' : 'cette invitation'}.
					</span>
				</p>
				<EmailVerificationButton class="btn shrink-0 btn-sm btn-primary" label="Confirmer" />
			</div>
		{/if}

		<ul class="mt-1 space-y-2">
			{#each data.invitations as member (member.id)}
				<li
					class={[
						'flex flex-wrap items-center justify-between gap-x-3 gap-y-2 p-3',
						'border border-soft rounded-box',
						data.emailToVerify ? 'bg-dash' : 'bg-accent-soft',
					]}
				>
					<div class="min-w-0">
						<div class="truncate font-medium">{member.event.name}</div>
						{#if member.event.startDate}
							<div class="text-sm text-base-content/70">
								{invitationDateFormater.format(member.event.startDate)}
							</div>
						{/if}
					</div>
					<a
						href={resolve('/[eventId]/me', { eventId: member.eventId })}
						class={['btn shrink-0 btn-sm btn-primary', data.emailToVerify && 'btn-disabled']}
					>
						Voir l'invitation
					</a>
				</li>
			{/each}
		</ul>
	</section>
{/if}
