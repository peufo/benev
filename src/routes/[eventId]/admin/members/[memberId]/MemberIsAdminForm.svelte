<script lang="ts">
	import { enhance } from '$app/forms'
	import type { PageData } from './$types'
	import { useForm } from '$lib/validation'
	import { rolesMap } from '$lib/member/MemberRole.svelte'
	import { Icon } from '$lib/material'

	export let memberProfile: PageData['memberProfile']

	$: isAdmin = memberProfile.roles.includes('admin')

	const form = useForm()
</script>

<form action="?/set_isAdmin" method="post" use:enhance={form.submit} class="contents">
	<input type="hidden" name="isAdmin" value={isAdmin ? '' : 'true'} />
	<button class="menu-item">
			<Icon path={rolesMap[isAdmin ? 'member' : 'admin'].icon} size={20}/>
			<span>{isAdmin ? 'Retirer' : 'Attribuer' } le rôle d'administrateur</span>
	</button>
</form>
