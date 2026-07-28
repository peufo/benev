<script lang="ts" module>
	import type { Event, Field } from '@prisma/client'
	import { Form, tip } from '$lib/fuma'

	export type TeamFormComponent = ComponentType<Form<typeof modelTeam, TeamWithComputedValues>>
	export type TeamFormInstance = InstanceType<TeamFormComponent>
</script>

<script lang="ts">
	import { page } from '$app/stores'
	import { toast } from 'svelte-sonner'
	import { InputText, InputTextarea, InputDate, InputBoolean } from '$lib/fuma'

	import { MemberConditions } from '$lib/member'
	import InputLeaders from '$lib/team/InputLeaders.svelte'
	import { eventPath } from '$lib/store'
	import { type ComponentType } from 'svelte'
	import { modelTeam } from '$lib/models'
	import type { TeamWithComputedValues } from '$lib/server'

	interface Props {
		class?: string
		event: Event & { memberFields: Field[] }
		team?: Partial<TeamWithComputedValues>
		teamForm?: TeamFormInstance | undefined
	}

	let {
		class: klass = '',
		event,
		team = $bindable({}),
		teamForm = $bindable(undefined),
	}: Props = $props()

	const TeamForm: TeamFormComponent = Form
</script>

<TeamForm
	class={klass}
	action="{$eventPath}/teams?/team"
	model={modelTeam}
	bind:data={team}
	on:success
	bind:this={teamForm}
	options={{
		onSubmit({ action, cancel, submitter }) {
			if (!action.searchParams.has('/team_delete')) return
			const nb = team.nbSubscribes || 0
			if (nb === 0) return
			const msg = [
				`Ce secteur contient déjà ${nb} inscription${nb > 1 ? 's' : ''} !`,
				'Es-tu certain de vouloir le supprimer ?',
			].join('\n')
			if (confirm(msg)) return
			cancel()
			toast.info('Suppession du secteur annulée !')
			setTimeout(() => {
				submitter?.classList.remove('btn-disabled')
			}, 200)
		},
	}}
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
		<div class="grid grid-cols-2 gap-2">
			<InputDate
				key="closeSubscribing"
				label="Fin des inscriptions"
				bind:value={team.closeSubscribing}
				hint={event.closeSubscribing && !team?.closeSubscribing
					? `Par défaut: ${event.closeSubscribing.toLocaleDateString()}`
					: ''}
			/>
			<div
				use:tip={{
					content:
						'Les inscriptions en attentes de validation ne sont pas comptabilisées. Ainsi, elles ne bloquent pas de nouvelles inscriptions.',
				}}
			>
				<InputBoolean
					key="overflowPermitted"
					label="Mode liste d'attente"
					bind:value={team.overflowPermitted}
				/>
			</div>
		</div>
	{/if}

	<MemberConditions conditions={team?.conditions || []} memberFields={event.memberFields} />
</TeamForm>
