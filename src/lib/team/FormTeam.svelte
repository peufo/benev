<svelte:options accessors={true} />

<script lang="ts">
	import { InputText, InputTextarea, InputDate, Form, type UseFormOptions } from 'fuma'
	import type { ComponentType } from 'svelte'
	import type { Team, Member, User, Event, Field } from '@prisma/client'
	import { page } from '$app/stores'
	import { eventPath } from '$lib/store'
	import { MemberConditions } from '$lib/member'
	import InputLeaders from '$lib/team/InputLeaders.svelte'
	import { modelTeam } from '$lib/models'
	type TeamWithLeaders = Team & { leaders: (Member & { user: User })[] }
	let klass = ''
	export { klass as class }
	export let event: Event & { memberFields: Field[] }
	export let team: TeamWithLeaders | undefined = undefined

	const FormTeam: ComponentType<Form<typeof modelTeam, TeamWithLeaders>> = Form
	export let form: InstanceType<typeof FormTeam> | undefined = undefined
</script>

<FormTeam
	bind:this={form}
	on:success
	model={modelTeam}
	data={team}
	class={klass}
	action="{$eventPath}/teams?/team"
>
	<InputText
		key="name"
		label="Nom du secteur"
		class="mt-6"
		value={team?.name}
		input={{ autofocus: true }}
	/>

	{#if $page.data.member?.roles.includes('admin')}
		<InputLeaders value={team?.leaders} />
	{/if}
	<InputTextarea key="description" label="Description" value={team?.description || ''} />

	{#if event.selfSubscribeAllowed}
		<InputDate
			key="closeSubscribing"
			label="Fin des inscriptions"
			value={team?.closeSubscribing}
			hint={event.closeSubscribing && !team?.closeSubscribing
				? `Par défaut: ${event.closeSubscribing.toLocaleDateString()}`
				: ''}
		/>
	{/if}

	<MemberConditions conditions={team?.conditions || []} memberFields={event.memberFields} />
</FormTeam>
