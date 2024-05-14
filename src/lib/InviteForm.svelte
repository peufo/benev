<script lang="ts">
	import type { Member, User } from '@prisma/client'

	import { modelInvite } from '$lib/models'
	import { eventPath } from '$lib/store'
	import { Form, type UseFormOptions } from 'fuma'
	import type { ComponentType } from 'svelte'

	type MemberWithUser = Member & { user: User }
	const InviteForm: ComponentType<Form<typeof modelInvite, MemberWithUser>> = Form
</script>

<InviteForm
	action="{$eventPath}/invite?/invite"
	model={modelInvite}
	options={{
		successMessage: 'Invitation envoyée',
		successUpdate: false,
	}}
	on:created
	on:updated
	on:deleted
	on:success
	fields={[
		[
			{
				key: 'email',
				colSpan: 4,
				text: {
					label: 'Email',
					input: { autocomplete: 'off', autofocus: true },
				},
			},
			{
				key: 'firstName',
				text: {
					label: 'Prénom',
					input: { autocomplete: 'off' },
				},
			},
			{
				key: 'lastName',
				text: {
					label: 'Nom',
					input: { autocomplete: 'off' },
				},
			},
		],
	]}
/>
