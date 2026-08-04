<script lang="ts" module>
	export type TeamFormInstance = {
		update: (
			updater: (team: Partial<TeamWithComputedValues>) => Partial<TeamWithComputedValues>
		) => void
	}
</script>

<script lang="ts">
	import type { Event, Field } from '@prisma/client'
	import { page } from '$app/state'
	import { toast } from 'svelte-sonner'
	import { ButtonDelete, InputBoolean, InputString, InputTextarea, tip } from 'fuma'

	import { MemberConditions } from '$lib/member'
	import { enhanceForm } from '$lib/enhanceForm'
	import InputLeaders from '$lib/team/InputLeaders.svelte'
	import type { TeamWithComputedValues } from '$lib/server'
	import { createTeam, deleteTeam, updateTeam } from './team.remote'

	interface Props {
		class?: string
		event: Event & { memberFields: Field[] }
		team?: Partial<TeamWithComputedValues>
		teamForm?: TeamFormInstance | undefined
		onsuccess?: () => void
	}

	let {
		class: klass = '',
		event,
		team = $bindable({}),
		teamForm = $bindable(undefined),
		onsuccess,
	}: Props = $props()

	const remoteForm = $derived(team.id ? updateTeam : createTeam)

	// `DrawersForm` s'en sert pour injecter un responsable fraîchement invité.
	teamForm = {
		update(updater) {
			team = updater(team)
		},
	}

	function confirmDelete() {
		const nb = team.nbSubscribes || 0
		if (nb === 0) return true
		const msg = [
			`Ce secteur contient déjà ${nb} inscription${nb > 1 ? 's' : ''} !`,
			'Es-tu certain de vouloir le supprimer ?',
		].join('\n')
		if (confirm(msg)) return true
		toast.info('Suppession du secteur annulée !')
		return false
	}
</script>

<form
	{...remoteForm.enhance(enhanceForm({ success: 'Succès', onsuccess: () => onsuccess?.() }))}
	class="flex flex-col gap-4 {klass}"
>
	{#if team.id}
		<input type="hidden" name="id" value={team.id} />
	{/if}

	<InputString
		field={remoteForm.fields.name}
		label="Nom du secteur"
		value={team.name}
		class="mt-8"
	/>

	{#if page.data.member?.roles.includes('admin')}
		<InputLeaders field={remoteForm.fields.leaders} value={team.leaders} />
	{/if}
	<InputTextarea
		field={remoteForm.fields.description}
		label="Description"
		value={team.description ?? ''}
	/>

	{#if event.selfSubscribeAllowed}
		<div class="grid grid-cols-2 gap-2">
			<InputString
				field={remoteForm.fields.closeSubscribing}
				type="date"
				label="Fin des inscriptions"
				value={team.closeSubscribing?.toISOString().slice(0, 10) ?? ''}
				placeholder={event.closeSubscribing && !team?.closeSubscribing
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
					field={remoteForm.fields.overflowPermitted}
					label="Mode liste d'attente"
					checked={team.overflowPermitted ?? false}
					defaultChecked={team.overflowPermitted ?? false}
				/>
			</div>
		</div>
	{/if}

	<MemberConditions conditions={team?.conditions || []} memberFields={event.memberFields} />

	<div class="flex flex-row-reverse gap-2 border-t pt-4">
		<button class="btn btn-primary">Valider</button>
	</div>
</form>

{#if team.id}
	<form
		{...deleteTeam.enhance(
			enhanceForm({
				before: confirmDelete,
				success: 'Secteur supprimé',
				onsuccess: () => onsuccess?.(),
			})
		)}
		class="flex"
	>
		<input type="hidden" name="id" value={team.id} />
		<ButtonDelete formaction={deleteTeam.action}>Supprimer</ButtonDelete>
	</form>
{/if}
