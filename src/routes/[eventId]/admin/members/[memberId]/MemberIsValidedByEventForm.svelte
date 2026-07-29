<script lang="ts">
	import { mdiCancel, mdiCheck } from '@mdi/js'
	import type { PageData } from './$types'
	import { Icon } from '$lib/fuma-legacy'
	import { setMemberIsValidedByEvent } from '$lib/member/memberAdmin.remote'

	interface Props {
		memberProfile: PageData['memberProfile']
	}

	let { memberProfile }: Props = $props()
</script>

<form {...setMemberIsValidedByEvent} class="contents">
	<input
		{...setMemberIsValidedByEvent.fields.isValidedByEvent.as(
			'hidden',
			!memberProfile.isValidedByEvent
		)}
	/>
	<button class="menu-item w-full">
		<Icon
			path={memberProfile.isValidedByEvent ? mdiCancel : mdiCheck}
			size={21}
			class="opacity-80"
		/>
		<span>{memberProfile.isValidedByEvent ? 'Désapprouver' : 'Approuver'} la participation</span>
	</button>
</form>
