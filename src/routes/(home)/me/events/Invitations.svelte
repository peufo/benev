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
	<section class="mt-4 rounded-2xl border border-soft bg-secondary/10 p-4">
		<h2 class="title-sm uppercase">
			Invitation{data.invitations.length > 1 ? 's' : ''} en attente
		</h2>

		<!-- La reprise d'une fiche demande une adresse prouvée: le dire ici, où l'invitation se lit,
		     plutôt que de la laisser buter au bout du tunnel. -->
		{#if data.emailToVerify}
			<div class="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
				<p class="flex min-w-0 items-center gap-2 text-sm">
					<MailWarningIcon size={18} class="shrink-0 text-warning" />
					<span>
						Confirme <b class="break-all">{data.emailToVerify}</b> pour reprendre
						{data.invitations.length > 1 ? 'ces invitations' : 'cette invitation'}.
					</span>
				</p>
				<EmailVerificationButton class="btn shrink-0 btn-sm btn-primary" label="Confirmer" />
			</div>
		{/if}

		<ul class="mt-1">
			{#each data.invitations as member (member.id)}
				<li
					class="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-soft py-3 first:border-t-0"
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
						class="btn shrink-0 btn-sm btn-primary"
					>
						Voir l'invitation
					</a>
				</li>
			{/each}
		</ul>
	</section>
{/if}
