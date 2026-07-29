<script lang="ts">
	import type { Event } from '@prisma/client'
	import { InputBoolean, InputNumber, InputString } from 'fuma'
	import { slide } from 'svelte/transition'
	import { toast } from 'svelte-sonner'
	import { updateEventSettings as remoteForm } from './event.remote'

	interface Props {
		event: Event
	}

	let { event = $bindable() }: Props = $props()
</script>

<form
	{...remoteForm.enhance(async ({ submit }) => {
		await submit()
		toast.success('Succès')
	})}
>
	<div class="flex flex-col gap-2">
		<h3 class="font-medium opacity-80 mb-2">Permissions</h3>
		<InputBoolean
			field={remoteForm.fields.selfRegisterAllowed}
			label="Les utilisateurs peuvent devenir membre sans invitation"
			checked={event.selfRegisterAllowed}
			defaultChecked={event.selfRegisterAllowed}
			onchange={(e) => (event.selfRegisterAllowed = e.currentTarget.checked)}
		/>
		<InputBoolean
			field={remoteForm.fields.selfSubscribeAllowed}
			label="Les membres peuvent s'inscrire aux périodes de travail"
			checked={event.selfSubscribeAllowed}
			defaultChecked={event.selfSubscribeAllowed}
			onchange={(e) => (event.selfSubscribeAllowed = e.currentTarget.checked)}
		/>

		<InputBoolean
			field={remoteForm.fields.selfSubscribeCancelAllowed}
			label="Les membre peuvent {event.selfSubscribeAllowed
				? 'annuler ou '
				: ''}décliner leurs inscriptions"
			checked={event.selfSubscribeCancelAllowed}
			defaultChecked={event.selfSubscribeCancelAllowed}
		/>

		<InputNumber
			field={remoteForm.fields.overlapPeriodAllowed}
			label="Nombre de minutes de chevauchement toléré entre les shifts d'un membre"
			defaultValue={event.overlapPeriodAllowed}
			min={0}
		/>

		{#if event.selfSubscribeAllowed}
			<div transition:slide={{ duration: 200 }}>
				<InputString
					field={remoteForm.fields.closeSubscribing}
					type="date"
					label="Fin des inscriptions par défaut"
					defaultValue={event.closeSubscribing?.toISOString().slice(0, 10) ?? ''}
				/>
			</div>
		{/if}
	</div>

	<div class="mt-10">
		<h3 class="font-medium opacity-75 mb-2">Informations de compte requises</h3>

		<div class="grid grid-cols-2 gap-x-2">
			<InputBoolean label="Nom, prénom et email" checked disabled />
			<InputBoolean
				label="Adresse email verifié"
				field={remoteForm.fields.userEmailVerifiedRequired}
				checked={event.userEmailVerifiedRequired}
				defaultChecked={event.userEmailVerifiedRequired}
			/>
			<InputBoolean
				label="Adresse postale"
				field={remoteForm.fields.userAddressRequired}
				checked={event.userAddressRequired}
				defaultChecked={event.userAddressRequired}
			/>
			<InputBoolean
				label="Numéro de téléphone"
				field={remoteForm.fields.userPhoneRequired}
				checked={event.userPhoneRequired}
				defaultChecked={event.userPhoneRequired}
			/>
			<InputBoolean
				label="Date de naissance"
				field={remoteForm.fields.userBirthdayRequired}
				checked={event.userBirthdayRequired}
				defaultChecked={event.userBirthdayRequired}
			/>
			<InputBoolean
				label="Photo de profil"
				field={remoteForm.fields.userAvatarRequired}
				checked={event.userAvatarRequired}
				defaultChecked={event.userAvatarRequired}
			/>
		</div>
	</div>

	<div class="flex justify-end mt-2">
		<button class="btn btn-primary">Valider</button>
	</div>
</form>
