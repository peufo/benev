<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import { enhance } from '$app/forms'

	import { useForm } from 'fuma/validation'
	import { eventPath } from '$lib/store'
	import MemberField from './MemberField.svelte'
	import type { MemberProfile } from '$lib/server'
	import { Form } from 'fuma'

	let klass = ''
	export { klass as class }
	export let member: MemberProfile
	export let writeOnly = false
	export let successUpdate = true

	const dispatch = createEventDispatcher<{ success: void }>()

	const form = useForm({
		successReset: false,
		successUpdate,
		onSuccess: () => dispatch('success'),
	})
</script>

<div class="@container">
	<Form
		action="{$eventPath}/me?/member_profile"
		actionCreate="_update"
		class="grid grid-cols-3 @lg:grid-cols-6 @2xl:grid-cols-12 gap-4 {klass}"
		on:success
	>
		<input type="hidden" name="memberId" value={member.id} />

		{#each member.event.memberFields.filter((f) => !writeOnly || f.memberCanWrite) as field (field.id)}
			{@const value = member.profileJson[field.id] || ''}
			<MemberField {field} {value} class="col-span-3" />
		{/each}
	</Form>
</div>
