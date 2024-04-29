<script lang="ts">
	import { enhance } from '$app/forms'
	import { mdiCheck } from '@mdi/js'
	import type { PageData } from './$types'
	import { useForm } from '$lib/validation'
	import { Icon } from 'fuma'

	export let memberProfile: PageData['memberProfile']

	const form = useForm()
</script>

<form action="?/set_isValidedByEvent" method="post" use:enhance={form.submit} class="contents">
	<input
		type="hidden"
		name="isValidedByEvent"
		value={memberProfile.isValidedByEvent ? '' : 'true'}
	/>
	<button class="menu-item w-full">
		<Icon path={mdiCheck} size={21} class="opacity-80" />
		<span>{memberProfile.isValidedByEvent ? 'Invalider' : 'Valider'} la participation</span>
	</button>
</form>
