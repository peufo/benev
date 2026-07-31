<script lang="ts">
	import { CheckIcon, PencilIcon, XIcon } from '@lucide/svelte'
	import type { MemberProfile } from '$lib/server'
	import { page } from '$app/stores'
	import { MemberProfileForm, MemberProfileStatus, MemberRole } from '$lib/member'
	import { CardBasic, Placeholder } from '$lib/fuma-legacy'
	import { Drawer, tip } from 'fuma'
	import { urlParam } from 'fuma'
	import { fade } from 'svelte/transition'

	interface Props {
		member: MemberProfile
		title?: string
		hideStatus?: boolean
	}

	let { member, title = 'Profil', hideStatus = false }: Props = $props()

	let profile = $derived(
		member.event.memberFields.map((field) => ({
			field,
			value: member.profileJson[field.id],
		}))
	)
</script>

<div class="flex gap-2 items-center mb-4">
	<h3 class="title">{title}</h3>
	{#if !hideStatus}
		<MemberRole roles={member.roles} />
		<MemberProfileStatus {member} />
	{/if}
	{#if $page.data.member?.roles.includes('leader') || member.event.memberFields.filter((f) => f.memberCanWrite).length}
		<a
			href={urlParam.with({ form_member_profile: '{}' })}
			data-sveltekit-replacestate
			data-sveltekit-noscroll
			class="btn btn-square btn-sm ml-2"
		>
			<span class="inline-flex" use:tip={{ content: `Modifier le profil de ${member.firstName}` }}
				><PencilIcon /></span
			>
		</a>
	{/if}
</div>

{#if !profile.length}
	<Placeholder>Profil vide</Placeholder>
{:else}
	<div
		in:fade
		class="grid gap-4 mb-4 items-start"
		style:grid-template-columns="repeat(auto-fill, minmax(min(230px, 100%), 1fr))"
	>
		{#each profile as { field, value } (field.id)}
			<CardBasic title={field.name}>
				{#if typeof value === 'string' || typeof value === 'number'}
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
						{/each}
					</ul>
				{/if}
			</CardBasic>
		{/each}
	</div>
{/if}

<Drawer title="Modifier le profil de {member.firstName}" key="form_member_profile" classBody="pt-4">
	{#snippet children({ close })}
		<MemberProfileForm memberProfile={member} onsuccess={() => close()} />
	{/snippet}
</Drawer>
