<script lang="ts">
	import { tip } from 'fuma'
	import { CheckIcon, OctagonAlertIcon, OctagonXIcon, Trash2Icon } from '@lucide/svelte'
	import type { Subscribe } from '@prisma/client'

	interface Props {
		class?: string
		subscribe: Subscribe & { member: { isValidedByUser: boolean } }
	}

	let { class: klass = '', subscribe }: Props = $props()

	let changeAuthor = $derived(
		(subscribe.createdBy === 'user') ===
			(subscribe.state === 'cancelled' || subscribe.state === 'request')
			? 'par le membre'
			: 'par un responsable'
	)
</script>

{#if subscribe.state === 'request' && subscribe.createdBy === 'leader' && !subscribe.member.isValidedByUser}
	<span class="inline-flex" use:tip={{ content: 'En attente de validation du membre (inactif)' }}>
		<OctagonAlertIcon class="text-error {klass}" />
	</span>
{:else if subscribe.state === 'request'}
	<span
		class="inline-flex"
		use:tip={{
			content: `En attente de validation ${subscribe.createdBy === 'user' ? `d'un responsable` : `du membre`}`,
		}}
	>
		<OctagonAlertIcon class="text-warning {klass}" />
	</span>
{:else if subscribe.state === 'accepted' && subscribe.isForcedValidation}
	<span
		class="inline-flex"
		use:tip={{ content: 'Inscription confirmée par un responsable au nom du membre' }}
	>
		<CheckIcon class="text-blue-500 {klass}" />
	</span>
{:else if subscribe.state === 'accepted'}
	<span class="inline-flex" use:tip={{ content: `Inscription confirmée ${changeAuthor}` }}>
		<CheckIcon class="text-success {klass}" />
	</span>
{:else if subscribe.state === 'denied'}
	<span class="inline-flex" use:tip={{ content: `Inscription déclinée ${changeAuthor}` }}>
		<OctagonXIcon class="text-error {klass}" />
	</span>
{:else if subscribe.state === 'cancelled'}
	<span class="inline-flex" use:tip={{ content: `Inscription annulée ${changeAuthor}` }}>
		<Trash2Icon class="text-error {klass}" />
	</span>
{/if}
