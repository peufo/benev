<script lang="ts">
	import { mdiCancel, mdiCheck } from '@mdi/js'
	import type { PageData } from './$types'
	import { useForm } from 'fuma/validation'
	import { Icon, USE_COERCE_BOOLEAN } from 'fuma'

	export let memberProfile: PageData['memberProfile']
	const { enhance } = useForm()
</script>

<form action="?/set_isValidedByEvent" method="post" use:enhance class="contents">
	<input
		type="hidden"
		name="isValidedByEvent"
		value="{USE_COERCE_BOOLEAN}{!memberProfile.isValidedByEvent}"
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
