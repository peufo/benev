<script lang="ts">
	import type { MemberProfile } from '$lib/server'
	import { Form, InputDate, InputText } from 'fuma'
	import { modelUserContactUpdate } from '$lib/models'

	let klass = ''
	export { klass as class }
	export let member: MemberProfile
</script>

<Form
	action="?/member_contact_update"
	model={modelUserContactUpdate}
	simpleAction
	class="grid grid-cols-2 gap-4 {klass}"
	on:success
>
	<InputText
		key="email"
		label="Email"
		value={member.email}
		class="col-span-2"
		input={{ inputmode: 'email' }}
	/>

	<InputText key="firstName" label="Prénom" value={member.firstName} />
	<InputText key="lastName" label="Nom de famille" value={member.lastName} />

	<InputDate key="birthday" label="Date de naissance" value={member.birthday} />
	<InputText
		key="phone"
		label="Téléphone"
		value={member.phone || ''}
		input={{ inputmode: 'tel' }}
	/>

	<InputText key="street" label="Rue et numéro" value={member.street || ''} class="col-span-2" />
	<InputText key="zipCode" label="Code postal" value={member.zipCode || ''} />
	<InputText key="city" label="Localité" value={member.city || ''} />
</Form>
