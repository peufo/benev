<script lang="ts">
	import type { Event, Field, Team } from '@prisma/client'
	import { page } from '$app/state'
	import { InputBoolean, InputString, InputTextarea } from 'fuma'

	import { MemberConditions } from '$lib/member'
	import { enhanceForm } from '$lib/enhanceForm'
	import { SaveBar } from '$lib/ui'
	import InputLeaders from '$lib/team/InputLeaders.svelte'
	import type { TeamWithComputedValues } from '$lib/server'
	import { createTeam, updateTeam } from './team.remote'
	import { registerTeamForm } from './teamFormActive.svelte'

	interface Props {
		class?: string
		event: Event & { memberFields: Field[] }
		team?: Partial<TeamWithComputedValues>
		/**
		 * Barre flottante à la première retouche, au lieu du bouton de validation. Le secteur
		 * s'édite alors là où il s'affiche, sans étape de bascule.
		 */
		saveBar?: boolean
		oncreated?: (team: Team) => void
		onupdated?: (team: Team) => void
	}

	let {
		class: klass = '',
		event,
		team = $bindable({}),
		saveBar = false,
		oncreated,
		onupdated,
	}: Props = $props()

	const formId = $props.id()

	// Une instance par secteur édité: le formulaire de la page et celui du tiroir de création
	// peuvent être montés en même temps, et passer d'un secteur au suivant ne doit rien traîner.
	const remoteForm = $derived(team.id ? updateTeam.for(team.id) : createTeam.for(formId))

	// `DrawersForm` s'en sert pour injecter un responsable fraîchement invité.
	registerTeamForm((updater) => (team = updater(team)))

	let formElement = $state<HTMLFormElement>()
	let bar = $state<ReturnType<typeof SaveBar>>()
	// Remonte les responsables et les conditions, dont la sélection vit dans le composant: le
	// `reset()` natif ne restaure que les `defaultValue` du DOM.
	let resetToken = $state(0)
</script>

<!-- `id` après le spread: `enhance()` pose ses propres attributs, et les siens gagneraient. -->
<form
	{...remoteForm.enhance(
		enhanceForm({
			success: 'Succès',
			onsuccess: () => {
				bar?.rebase()
				// `result` porte le secteur tel qu'enregistré: c'est lui que l'appelant doit
				// afficher, le sien datant de son propre chargement.
				const saved = remoteForm.result
				if (!saved) return
				if (team.id) onupdated?.(saved)
				else oncreated?.(saved)
			},
		})
	)}
	id={formId}
	bind:this={formElement}
	class="flex flex-col gap-4 {klass}"
>
	{#if team.id}
		<input type="hidden" name="id" value={team.id} />
	{/if}

	<InputString field={remoteForm.fields.name} label="Nom du secteur" value={team.name} />

	{#key resetToken}
		{#if page.data.member?.roles.includes('admin')}
			<InputLeaders field={remoteForm.fields.leaders} value={team.leaders} />
		{/if}
	{/key}

	<InputTextarea
		field={remoteForm.fields.description}
		label="Description"
		value={team.description ?? ''}
	/>

	{#if event.selfSubscribeAllowed}
		<InputString
			field={remoteForm.fields.closeSubscribing}
			type="date"
			label="Fin des inscriptions"
			value={team.closeSubscribing?.toISOString().slice(0, 10) ?? ''}
			placeholder={event.closeSubscribing && !team?.closeSubscribing
				? `Par défaut: ${event.closeSubscribing.toLocaleDateString()}`
				: ''}
		/>
		<InputBoolean
			field={remoteForm.fields.overflowPermitted}
			label="Mode liste d'attente"
			checked={team.overflowPermitted ?? false}
			variant="switch"
			hint="Les inscriptions en attente de validation ne comptent pas comme des places occupées."
		/>
	{/if}

	{#key resetToken}
		<MemberConditions
			conditions={team?.conditions || []}
			memberFields={event.memberFields}
			onchange={() => bar?.refresh()}
		/>
	{/key}

	{#if !saveBar}
		<div class="flex flex-row-reverse gap-2 border-t py-4">
			<button class="btn btn-primary">Valider</button>
		</div>
	{/if}
</form>

{#if saveBar}
	<SaveBar
		bind:this={bar}
		form={formElement}
		{formId}
		key={team.id}
		pending={remoteForm.pending > 0}
		onreset={() => resetToken++}
	/>
{/if}
