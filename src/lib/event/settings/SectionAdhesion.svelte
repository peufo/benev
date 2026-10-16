<script lang="ts">
	import type { Event } from '@prisma/client'
	import { InputBoolean, InputDateTime, InputNumber, InputSelect } from 'fuma'
	import { slide } from 'svelte/transition'
	import { REMINDER_OPTIONS } from '#lib/period/periodReminder.js'
	import type { EventSettingsFields } from './types'

	interface Props {
		fields: EventSettingsFields
		event: Event
	}

	// `event` est muté localement par les deux premières cases pour piloter l'affichage
	// conditionnel avant l'enregistrement.
	let { fields, event = $bindable() }: Props = $props()

	// Le champ soumet une chaîne: le modèle la reconvertit en nombre d'heures.
	const reminderOptions = REMINDER_OPTIONS.map(({ value, label }) => ({
		value: String(value),
		label,
	}))
</script>

<div class="flex flex-col gap-2">
	<h3 class="title-md">Permissions</h3>
	<InputBoolean
		field={fields.selfRegisterAllowed}
		label="Tout le monde peut devenir membre sans invitation"
		checked={event.selfRegisterAllowed}
		onchange={(e) => (event.selfRegisterAllowed = e.currentTarget.checked)}
	/>
	<InputBoolean
		field={fields.selfSubscribeAllowed}
		label="Les membres peuvent s'inscrire aux créneaux"
		checked={event.selfSubscribeAllowed}
		onchange={(e) => (event.selfSubscribeAllowed = e.currentTarget.checked)}
	/>

	<InputBoolean
		field={fields.selfSubscribeCancelAllowed}
		label="Les membres peuvent {fields.selfSubscribeAllowed.value()
			? 'annuler ou '
			: ''}décliner leurs inscriptions"
		checked={event.selfSubscribeCancelAllowed}
	/>

	<InputNumber
		field={fields.overlapPeriodAllowed}
		label="Nombre de minutes de chevauchement toléré entre les créneaux d'un membre"
		value={event.overlapPeriodAllowed}
		min={0}
	/>

	{#if event.selfSubscribeAllowed}
		<!-- La fermeture programmée des secteurs qui n'ont pas la leur: `published` → `validated`. -->
		<div transition:slide={{ duration: 200 }}>
			<InputDateTime
				field={fields.closeSubscribing}
				layout="datetime"
				label="Fermeture des inscriptions par défaut"
				value={event.closeSubscribing}
				timezone={event.timezone}
			/>
		</div>
	{/if}
</div>

<div class="mt-10">
	<h3 class="title-md mb-2">Rappel avant les créneaux</h3>
	<InputSelect
		field={fields.reminderHours}
		label="Chaque inscription acceptée reçoit un courriel avant le début de son créneau"
		items={reminderOptions}
		value={reminderOptions.find(({ value }) => value === String(event.reminderHours))}
		class="w-full"
	/>
</div>

<div class="mt-10">
	<h3 class="title-md mb-2">Informations de compte requises</h3>

	<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
		<InputBoolean label="Nom, prénom et email" checked disabled />
		<InputBoolean
			label="Adresse email vérifiée"
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
