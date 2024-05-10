<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import type { Member, User } from '@prisma/client'

	import { modelInvite } from '$lib/models'
	import { eventPath } from '$lib/store'
	import { Form, type UseFormOptions } from 'fuma'

	type MemberWithUser = Member & { user: User }
	const dispatch = createEventDispatcher<{ success: MemberWithUser | undefined }>()

	const options: UseFormOptions<MemberWithUser> = {
		onSuccess: (action, member) => dispatch('success', member),
		successMessage: 'Invitation envoyée',
		successUpdate: false,
	}
</script>

<Form
	action="{$eventPath}/invite?/invite"
	model={modelInvite}
	{options}
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
