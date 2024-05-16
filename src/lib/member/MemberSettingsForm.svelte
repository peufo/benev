<script lang="ts">
	import type { Event } from '@prisma/client'
	import { eventPath } from '$lib/store'
	import { useForm } from 'fuma/validation'
	import { InputBoolean, InputDate } from 'fuma'
	import { slide } from 'svelte/transition'

	const { enhance } = useForm({
		successReset: false,
	})

	export let event: Event
</script>

<form method="post" use:enhance action="{$eventPath}/admin/adhesion?/set_member_settings">
	<div>
		<h3 class="font-medium opacity-80 mb-2">Permissions</h3>
		<InputBoolean
			key="selfRegisterAllowed"
			label="Les utilisateurs peuvent devenir membre sans invitation"
			bind:value={event.selfRegisterAllowed}
		/>
		<InputBoolean
			key="selfSubscribeAllowed"
			label="Les membres peuvent s'inscrire aux périodes de travail"
			bind:value={event.selfSubscribeAllowed}
		/>

		{#if event.selfSubscribeAllowed}
			<div transition:slide={{ duration: 200 }}>
				<InputDate
					key="closeSubscribing"
					label="Fin des inscriptions par défaut"
					value={event.closeSubscribing}
				/>
			</div>
		{/if}
	</div>

	<div class="mt-10">
		<h3 class="font-medium opacity-75 mb-2">Informations de compte requises</h3>

		<div class="grid grid-cols-2 gap-x-2">
			<InputBoolean label="Nom & prénom" value={true} input={{ disabled: true }} />
			<InputBoolean label="Adresse email" value={true} input={{ disabled: true }} />
			<InputBoolean
				label="Adresse postale"
				key="userAddressRequired"
				value={event.userAddressRequired}
			/>
			<InputBoolean
				label="Numéro de téléphone"
				key="userPhoneRequired"
				value={event.userPhoneRequired}
			/>
			<InputBoolean
				label="Date de naissance"
				key="userBirthdayRequired"
				value={event.userBirthdayRequired}
			/>
			<InputBoolean
				label="Photo de profil"
				key="userAvatarRequired"
				value={event.userAvatarRequired}
			/>
		</div>
	</div>

	<div class="flex justify-end mt-2">
		<button class="btn btn-primary">Valider</button>
	</div>
</form>
