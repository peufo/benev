<script lang="ts">
	import type { Event } from '@prisma/client'
	import { InputBoolean, InputNumber, InputString } from 'fuma'
	import { slide } from 'svelte/transition'
	import type { EventSettingsFields } from './types'

	interface Props {
		fields: EventSettingsFields
		event: Event
	}

	// `event` est muté localement par les deux premières cases pour piloter l'affichage
	// conditionnel avant l'enregistrement.
	let { fields, event = $bindable() }: Props = $props()
</script>

<div class="flex flex-col gap-2">
	<h3 class="title-md">Permissions</h3>
	<InputBoolean
		field={fields.selfRegisterAllowed}
		label="Les utilisateurs peuvent devenir membre sans invitation"
		checked={event.selfRegisterAllowed}
		onchange={(e) => (event.selfRegisterAllowed = e.currentTarget.checked)}
	/>
	<InputBoolean
		field={fields.selfSubscribeAllowed}
		label="Les membres peuvent s'inscrire aux périodes de travail"
		checked={event.selfSubscribeAllowed}
		onchange={(e) => (event.selfSubscribeAllowed = e.currentTarget.checked)}
	/>

	<InputBoolean
		field={fields.selfSubscribeCancelAllowed}
		label="Les membre peuvent {fields.selfSubscribeAllowed.value()
			? 'annuler ou '
			: ''}décliner leurs inscriptions"
		checked={event.selfSubscribeCancelAllowed}
	/>

	<InputNumber
		field={fields.overlapPeriodAllowed}
		label="Nombre de minutes de chevauchement toléré entre les périodes de travail d'un membre"
		value={event.overlapPeriodAllowed}
		min={0}
	/>

	{#if event.selfSubscribeAllowed}
		<div transition:slide={{ duration: 200 }}>
			<InputString
				field={fields.closeSubscribing}
				type="date"
				label="Fin des inscriptions par défaut"
				value={event.closeSubscribing?.toISOString().slice(0, 10) ?? ''}
			/>
		</div>
	{/if}
</div>

<div class="mt-10">
	<h3 class="title-md mb-2">Informations de compte requises</h3>

	<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
		<InputBoolean label="Nom, prénom et email" checked disabled />
		<InputBoolean
			label="Adresse email verifié"
			field={fields.userEmailVerifiedRequired}
			checked={event.userEmailVerifiedRequired}
		/>
		<InputBoolean
			label="Adresse postale"
			field={fields.userAddressRequired}
			checked={event.userAddressRequired}
		/>
		<InputBoolean
			label="Numéro de téléphone"
			field={fields.userPhoneRequired}
			checked={event.userPhoneRequired}
		/>
		<InputBoolean
			label="Date de naissance"
			field={fields.userBirthdayRequired}
			checked={event.userBirthdayRequired}
		/>
		<InputBoolean
			label="Photo de profil"
			field={fields.userAvatarRequired}
			checked={event.userAvatarRequired}
		/>
	</div>
</div>
