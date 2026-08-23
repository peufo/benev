<script lang="ts">
	import { resolve } from '$app/paths'
	import { goto } from '$app/navigation'
	import { Placeholder } from '$lib/ui'
	import { Dialog } from 'fuma'
	import { PlusIcon, ChevronRightIcon, RotateCcwClockIcon } from '@lucide/svelte'
	import EventEntry from './EventEntry.svelte'
	import { IsOrganizerForm } from '$lib/me'
	import type { EventMember } from './types'

	let { data } = $props()

	let becomeOrganizerDialog: HTMLDialogElement = $state()!

	let hasCurrent = $derived(data.upcoming.length + data.undated.length > 0)

	const invitationDateFormater = new Intl.DateTimeFormat('fr-ch', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	})

	const isEmpty = $derived(!data.upcoming.length && !data.undated.length)
</script>

<!-- L'onglet actif nomme déjà la page à l'écran; le `h1` reste pour que le document
     ait un titre et que les `h2` qui suivent ne soient pas orphelins. -->
<h1 class="sr-only">Mes évènements</h1>

<!-- INVITATIONS: en tête, avec l'action sous la main -->
{#if data.invitations.length}
	<section class="mt-4 rounded-2xl border border-soft bg-secondary/10 p-4">
		<h2 class="title-sm uppercase">
			Invitation{data.invitations.length > 1 ? 's' : ''} en attente
		</h2>
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

{#snippet group(label: string, members: EventMember[])}
	{#if members.length}
		<section class="mt-5">
			<h2 class="title-sm px-2 uppercase sm:px-3">{label}</h2>
			<ul class="mt-1">
				{#each members as member (member.id)}
					<EventEntry {member} />
				{/each}
			</ul>
		</section>
	{/if}
{/snippet}

{#if hasCurrent}
	{@render group('À venir', data.upcoming)}
	{@render group('Sans date', data.undated)}
{:else if !data.invitations.length}
	<div class="mt-4 flex flex-col gap-3">
		<Placeholder class="gap-3">
			<p class="text-center">
				{#if data.nbPast}
					Aucun évènement à venir.
				{:else}
					Tu n'es membre d'aucun évènement pour l'instant.
				{/if}
			</p>
		</Placeholder>
		<div class="text-center">
			<a href={resolve('/events')} class="btn btn-primary"> Trouver un évènement </a>
		</div>
	</div>
{/if}

<!-- Pied de page du registre: ce qui sort de la liste courante. Les terminés
     s'accumulent sans rien apporter au quotidien, et «Organiser» ne concerne qu'un
     organisateur — ni l'un ni l'autre n'a à passer devant le parcours du bénévole. -->
<div class="mt-6 flex flex-wrap gap-2">
	{#if data.nbPast}
		<a href={resolve('/me/events/past')} class="btn btn-ghost border-soft">
			<RotateCcwClockIcon size={18} class="shrink-0 opacity-60" />
			<span class="grow font-medium">
				{data.nbPast} évènement{data.nbPast > 1 ? 's' : ''} terminé{data.nbPast > 1 ? 's' : ''}
			</span>
			<ChevronRightIcon size={18} class="shrink-0 opacity-60" />
		</a>
	{/if}

	{#if data.user.isOrganizer}
		<a
			href={resolve('/me/events/create')}
			class={['btn btn-primary', !isEmpty && 'btn-soft', isEmpty ? 'mx-auto' : 'ml-auto']}
		>
			<PlusIcon size={18} class="shrink-0 opacity-60" />
			<span class="grow font-medium">Organiser un nouvel évènement</span>
		</a>
	{:else}
		<button
			onclick={() => becomeOrganizerDialog.showModal()}
			class={['btn btn-primary btn-soft', isEmpty ? 'mx-auto' : 'ml-auto']}
		>
			<PlusIcon size={18} class="shrink-0 opacity-60" />
			<span class="grow font-medium">Organiser un nouvel évènement</span>
		</button>
	{/if}
</div>

<Dialog bind:dialog={becomeOrganizerDialog}>
	{#snippet header()}
		<h2 class="card-title">Devenir organisateur</h2>
	{/snippet}
	<IsOrganizerForm
		oncancel={() => becomeOrganizerDialog.close()}
		onsuccess={() => {
			becomeOrganizerDialog.close()
			goto(resolve('/me/events/create'))
		}}
	/>
</Dialog>
