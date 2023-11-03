<script lang="ts">
	import { enhance } from '$app/forms'
	import type { PageData } from './$types'
	import { useForm } from '$lib/form'
	import MemberRole from '$lib/MemberRole.svelte'

	export let memberProfile: PageData['memberProfile']

	$: isAdmin = memberProfile.roles.includes('admin')

	const form = useForm()
</script>

<form action="?/set_isAdmin" method="post" use:enhance={form.submit}>
	<input type="hidden" name="isAdmin" value={isAdmin ? '' : 'true'} />
	<button class="btn btn-sm">
		<MemberRole roles={[isAdmin ? 'member' : 'admin']} mode="icon" />
		<span>{isAdmin ? 'Retirer' : 'Attribuer'} le rôle d'administrateur</span>
	</button>
</form>
