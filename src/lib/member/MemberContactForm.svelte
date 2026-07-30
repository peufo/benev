<script lang="ts">
	import type { MemberProfile } from '$lib/server'
	import { InputString } from 'fuma'
	import { toast } from 'svelte-sonner'
	import { updateMemberContact as remoteForm } from './memberAdmin.remote'

	interface Props {
		class?: string
		member: MemberProfile
		onsuccess?: () => void
	}

	let { class: klass = '', member, onsuccess }: Props = $props()
</script>

<form
	{...remoteForm.enhance(async ({ submit }) => {
		await submit()
		toast.success('Contact mis à jour')
		onsuccess?.()
	})}
	class="grid grid-cols-2 gap-4 {klass}"
>
	<InputString
		field={remoteForm.fields.email}
		label="Email"
		value={member.email ?? ''}
		class="col-span-2"
		inputmode="email"
	/>

	<InputString field={remoteForm.fields.firstName} label="Prénom" value={member.firstName} />
	<InputString field={remoteForm.fields.lastName} label="Nom de famille" value={member.lastName} />

	<InputString
		field={remoteForm.fields.birthday}
		type="date"
		label="Date de naissance"
		value={member.birthday?.toISOString().slice(0, 10) ?? ''}
	/>
	<InputString
		field={remoteForm.fields.phone}
		label="Téléphone"
		value={member.phone || ''}
		inputmode="tel"
	/>

	<InputString
		field={remoteForm.fields.street}
		label="Rue et numéro"
		value={member.street || ''}
		class="col-span-2"
	/>
	<InputString field={remoteForm.fields.zipCode} label="Code postal" value={member.zipCode || ''} />
	<InputString field={remoteForm.fields.city} label="Localité" value={member.city || ''} />

	<div class="col-span-2 flex flex-row-reverse">
		<button class="btn btn-primary">Valider</button>
	</div>
</form>
