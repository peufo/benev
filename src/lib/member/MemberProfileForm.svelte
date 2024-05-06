<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import { enhance } from '$app/forms'

	import { useForm } from 'fuma/validation'
	import { eventPath } from '$lib/store'
	import MemberField from './MemberField.svelte'
	import type { MemberProfile } from '$lib/server'

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
	<form
		method="post"
		action="{$eventPath}/me?/update_member_profile"
		use:enhance={form.submit}
		class="grid grid-cols-3 @lg:grid-cols-6 @2xl:grid-cols-12 gap-4 {klass}"
	>
		<input type="hidden" name="memberId" value={member.id} />

		{#each member.event.memberFields.filter((f) => !writeOnly || f.memberCanWrite) as field (field.id)}
			{@const value = member.profileJson[field.id] || ''}
			<MemberField {field} {value} class="col-span-3" />
		{/each}

		<div class="flex flex-row-reverse col-span-full">
			<button class="btn"> Sauvegarder </button>
		</div>
	</form>
</div>
