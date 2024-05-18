<script lang="ts">
	import { eventPath } from '$lib/store'
	import MemberField from './MemberField.svelte'
	import type { MemberProfile } from '$lib/server'
	import { Form } from 'fuma'

	let klass = ''
	export { klass as class }
	export let memberProfile: MemberProfile
</script>

<div class="@container">
	<Form
		action="{$eventPath}/me?/member_profile_update"
		simpleAction
		class="grid grid-cols-3 @lg:grid-cols-6 @2xl:grid-cols-12 gap-4 {klass}"
		on:success
	>
		<input type="hidden" name="memberId" value={memberProfile.id} />

		{#each memberProfile.event.memberFields as field (field.id)}
			{@const value = memberProfile.profileJson[field.id] || ''}
			<MemberField {field} {value} class="col-span-3" />
		{/each}
	</Form>
</div>
