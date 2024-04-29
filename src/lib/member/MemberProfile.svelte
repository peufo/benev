<script lang="ts">
	import type { MemberProfile } from '$lib/server'
	import { page } from '$app/stores'
	import { mdiCheck, mdiClose, mdiPencilOutline } from '@mdi/js'
	import { MemberProfileForm, MemberProfileStatus, MemberRole } from '$lib/member'
	import { CardBasic, Icon, Placeholder } from 'fuma'
	import { fade } from 'svelte/transition'

	export let member: MemberProfile
	export let readOnly = true
	export let writeOnly = false
	export let successUpdate = true
	export let classForm = ''

	export let title = 'Profile'
	export let hideStatus = false

	$: profile = member.event.memberFields
		.map((field) => ({
			field,
			value: member.profileJson[field.id],
		}))
		.filter((p) => p.value !== undefined)
</script>

<div class="flex gap-2 items-center mb-4">
	<h3 class="title">{title}</h3>
	{#if !hideStatus}
		<MemberRole roles={member.roles} />
		<MemberProfileStatus {member} />
	{/if}
	{#if $page.data.member?.roles.includes('leader') || member.event.memberFields.filter((f) => f.memberCanWrite).length}
		<button
			type="button"
			class="ml-auto btn btn-square btn-sm"
			on:click={() => (readOnly = !readOnly)}
		>
			<Icon
				path={readOnly ? mdiPencilOutline : mdiClose}
				title="{readOnly ? 'Modifier' : 'Voire'} le profile"
			/>
		</button>
	{/if}
</div>

{#if !readOnly}
	<div in:fade>
		<MemberProfileForm
			{member}
			class={classForm}
			{writeOnly}
			{successUpdate}
			on:success={() => (readOnly = true)}
		/>
	</div>
{:else if !profile.length}
	<Placeholder>Profil vide</Placeholder>
{:else}
	<div
		in:fade
		class="grid gap-4 mb-4 items-start"
		style:grid-template-columns="repeat(auto-fill, minmax(min(230px, 100%), 1fr))"
	>
		{#each profile as { field, value }}
			<CardBasic title={field.name}>
				{#if typeof value === 'string' || typeof value === 'number'}
					<p>{value || '-'}</p>
				{:else if value === true}
					<div class="badge">
						<Icon path={mdiCheck} size={14} class="fill-success" />
						<span class="ml-1">Oui</span>
					</div>
				{:else if value === false}
					<span class="badge">
						<Icon path={mdiClose} size={14} class="fill-error" />
						<span class="ml-1">Non</span>
					</span>
				{:else if Array.isArray(value)}
					<ul>
						{#each value as item}
							<li>• {item}</li>
						{/each}
					</ul>
				{/if}
			</CardBasic>
		{/each}
	</div>
{/if}
