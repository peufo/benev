<svelte:options accessors={true} />

<script lang="ts">
	import { Form, type UseFormOptions } from 'fuma'
	import type { Member, User } from '@prisma/client'
	import { modelInvite } from '$lib/models'
	import { eventPath } from '$lib/store'

	type MemberWithUser = Member & { user: User }
	export let options: UseFormOptions<MemberWithUser> = {}

	const _options: UseFormOptions<MemberWithUser> = {
		successMessage: 'Invitation envoyée',
	}
</script>

<Form
	action="{$eventPath}/invite?/invite"
	model={modelInvite}
	options={{ ..._options, ...options }}
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
