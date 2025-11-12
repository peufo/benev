<script lang="ts" context="module">
	import type { Team, Member, Event, Field } from '@prisma/client'
	import { Form } from 'fuma'

	export type TeamWithLeaders = Team & {
		leaders: Member[]
	}
	export type TeamFormComponent = ComponentType<Form<typeof modelTeam, TeamWithLeaders>>
	export type TeamFormInstance = InstanceType<TeamFormComponent>
</script>

<script lang="ts">
	import { page } from '$app/stores'
	import { InputText, InputTextarea, InputDate } from 'fuma'

	import { MemberConditions } from '$lib/member'
	import InputLeaders from '$lib/team/InputLeaders.svelte'
	import { eventPath } from '$lib/store'
	import type { ComponentType } from 'svelte'
	import { modelTeam } from '$lib/models'

	let klass = ''
	export { klass as class }

	export let event: Event & { memberFields: Field[] }
	export let team: Partial<TeamWithLeaders> = {}
	export let teamForm: TeamFormInstance | undefined = undefined

	const TeamForm: TeamFormComponent = Form
</script>

<TeamForm
	class={klass}
	action="{$eventPath}/teams?/team"
	model={modelTeam}
	bind:data={team}
	on:success
	bind:this={teamForm}
>
	<InputText
		key="name"
		label="Nom du secteur"
		bind:value={team.name}
		class="mt-8"
		input={{ autofocus: true }}
	/>

	{#if $page.data.member?.roles.includes('admin')}
		<InputLeaders bind:value={team.leaders} />
	{/if}
	<InputTextarea key="description" label="Description" bind:value={team.description} />

	{#if event.selfSubscribeAllowed}
		<InputDate
			key="closeSubscribing"
			label="Fin des inscriptions"
			bind:value={team.closeSubscribing}
			hint={event.closeSubscribing && !team?.closeSubscribing
				? `Par défaut: ${event.closeSubscribing.toLocaleDateString()}`
				: ''}
		/>
	{/if}

	<MemberConditions conditions={team?.conditions || []} memberFields={event.memberFields} />
</TeamForm>
