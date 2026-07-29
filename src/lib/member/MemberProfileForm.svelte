<script lang="ts">
	import MemberField from './MemberField.svelte'
	import type { MemberProfile } from '$lib/server'
	import { useNotify } from '$lib/notify'
	import { updateMemberProfile } from './member.remote'

	interface Props {
		class?: string
		memberProfile: MemberProfile
		onsuccess?: () => void
	}

	let { class: klass = '', memberProfile, onsuccess }: Props = $props()

	const notify = useNotify()
</script>

<div class="@container">
	<form
		{...updateMemberProfile.enhance(async ({ submit }) => {
			await submit()
			notify.success('Profil enregistré')
			onsuccess?.()
		})}
		class="grid grid-cols-3 @lg:grid-cols-6 @2xl:grid-cols-12 gap-4 {klass}"
	>
		<input type="hidden" name="memberId" value={memberProfile.id} />

		{#each memberProfile.event.memberFields as field (field.id)}
			{@const value = memberProfile.profileJson[field.id] || ''}
			<MemberField {field} {value} class="col-span-3" />
		{/each}

		<div
			class="sticky bottom-0 col-span-full mt-2 flex flex-row-reverse gap-2 border-t py-4 backdrop-blur-sm"
		>
			<button class="btn btn-primary">Valider</button>
		</div>
	</form>
</div>
