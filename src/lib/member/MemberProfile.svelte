<script lang="ts">
	import { CheckIcon, XIcon } from '@lucide/svelte'
	import type { MemberProfile } from '$lib/server'
	import { MemberProfileForm } from '$lib/member'
	import { Placeholder } from '$lib/ui'
	import { Drawer } from 'fuma'
	import { fade } from 'svelte/transition'

	interface Props {
		member: MemberProfile
		title?: string
		hideStatus?: boolean
	}

	let { member }: Props = $props()

	let profile = $derived(
		member.event.memberFields.map((field) => ({
			field,
			value: member.profileJson[field.id],
		}))
	)
</script>

{#if !profile.length}
	<Placeholder>Profil vide</Placeholder>
{:else}
	<div
		in:fade
		class="grid gap-4 mb-4 items-start"
		style:grid-template-columns="repeat(auto-fill, minmax(min(230px, 100%), 1fr))"
	>
		{#each profile as { field, value } (field.id)}
			<div class="">
				<span class="label text-sm px-2">{field.name}</span>
				<div class="border border-soft p-2 rounded-field">
					{#if typeof value === 'string' || typeof value === 'number' || value === undefined}
						<p>{value || '-'}</p>
					{:else if value === true}
						<div class="badge">
							<CheckIcon size={14} class="text-success" />
							<span class="ml-1">Oui</span>
						</div>
					{:else if value === false}
						<span class="badge">
							<XIcon size={14} class="text-error" />
							<span class="ml-1">Non</span>
						</span>
					{:else if Array.isArray(value)}
						<ul>
							{#each value as item, i (i)}
								<li>• {item}</li>
							{:else}
								<li>-</li>
							{/each}
						</ul>
					{/if}
				</div>
			</div>
		{/each}
	</div>
{/if}

<Drawer
	title="Modifier le profil de {member.firstName}"
	key="form_member_profile"
	class="surface-drawer"
	classBody="pt-4"
>
	{#snippet children({ close })}
		<MemberProfileForm memberProfile={member} onsuccess={() => close()} />
	{/snippet}
</Drawer>
