<script lang="ts">
	import { MailIcon, PhoneIcon, TriangleAlertIcon } from '@lucide/svelte'
	import type { Member } from '@prisma/client'
	import { Popover } from 'fuma'
	import { on } from 'svelte/events'
	import { Avatar } from '$lib/me'
	interface Props {
		leaders: Member[]
	}

	let { leaders }: Props = $props()
</script>

{#each leaders as member (member.id)}
	<Popover class="p-1 my-1">
		{#snippet trigger({ trigger })}
			<button
				type="button"
				{...trigger}
				class={[
					'hover:bg-base-200 bg-base-200/40 cursor-pointer',
					'flex gap-2 items-center pr-2 rounded-field border border-soft',
				]}
			>
				<Avatar
					firstName={member.firstName}
					avatarId={member.avatarId}
					avatarPlaceholder={member.avatarPlaceholder}
					class="h-8 w-8 rounded-[calc(var(--radius-field)-1px)]"
				/>
				<span class="text-sm">
					{member.firstName}
					{member.lastName}
				</span>
			</button>
		{/snippet}

		{#snippet children({ hide })}
			{#if member.userId}
				<div class="flex flex-col w-48" {@attach (node) => on(node, 'click', hide)}>
					<a class="menu-item" href="mailto:{member.email}" target="_blank">
						<MailIcon size={20} class="opacity-70" />
						Envoyer un mail
					</a>
					{#if member.phone}
						<a class="menu-item" href="tel:{member.phone}" target="_blank">
							<PhoneIcon size={20} class="opacity-70" />
							Téléphoner
						</a>
					{/if}
				</div>
			{:else}
				<div class="px-3 py-1 flex gap-2 max-w-64">
					<TriangleAlertIcon class="text-warning shrink-0" size={20} />
					<span class="text-sm">
						{member.firstName} n'a pas de compte : ses coordonnées ne sont pas partagées ici.
					</span>
				</div>
			{/if}
		{/snippet}
	</Popover>
{:else}
	<div class="text-error text-sm">Pas de responsable</div>
{/each}
