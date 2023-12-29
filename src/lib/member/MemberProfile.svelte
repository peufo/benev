<script lang="ts">
	import type { MemberProfile } from '$lib/server'
	import { mdiCheck, mdiClose, mdiPencil } from '@mdi/js'
	import type { FieldType } from '@prisma/client'
	import { MemberProfileForm, MemberProfileStatus, MemberRole } from '$lib/member'
	import { Icon } from '$lib/material'
	import { jsonParse } from '$lib/jsonParse'
	import { fade } from 'svelte/transition'

	export let member: MemberProfile
	export let readOnly = true
	export let writeOnly = false
	export let successUpdate = true
	export let classForm = ''

	export let title = 'Profile'
	export let hideStatus = false

	const simpleTypes: FieldType[] = ['string', 'number', 'textarea', 'select']
	const parseMultiSelectValue = (value: string) => jsonParse<string[]>(value, [])
</script>

<div class="flex gap-2 items-center mb-4">
	<h3 class="title">{title}</h3>
	{#if !hideStatus}
		<MemberRole roles={member.roles} />
		<MemberProfileStatus {member} />
	{/if}
	<button
		type="button"
		class="ml-auto btn btn-square btn-sm"
		on:click={() => (readOnly = !readOnly)}
	>
		<Icon
			path={readOnly ? mdiPencil : mdiClose}
			title="{readOnly ? 'Modifier' : 'Voire'} le profile"
		/>
	</button>
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
{:else}
	{@const profile = member.profile.filter(
		({ field, value }) => value !== '[]' && (value || field.type === 'boolean')
	)}

	<div
		in:fade
		class="grid gap-6 mb-6"
		style:grid-template-columns="repeat(auto-fill, minmax(min(230px, 100%), 1fr))"
	>
		{#each profile as { field, value }}
			<div>
				<h4 class="text-sm opacity-80 mb-1">{field.name}</h4>

				{#if simpleTypes.includes(field.type)}
					<p>{value || '-'}</p>
				{:else if field.type === 'boolean'}
					{#if value}
						<div class="badge">
							<Icon path={mdiCheck} size={14} class="fill-success" />
							<span class="ml-1">Oui</span>
						</div>
					{:else}
						<span class="badge">
							<Icon path={mdiClose} size={14} class="fill-error" />
							<span class="ml-1">Non</span>
						</span>
					{/if}
				{:else if field.type === 'multiselect'}
					{@const items = parseMultiSelectValue(value)}
					<ul>
						{#each items as item}
							<li>• {item}</li>
						{/each}
					</ul>
				{/if}
			</div>
		{/each}
	</div>
{/if}
