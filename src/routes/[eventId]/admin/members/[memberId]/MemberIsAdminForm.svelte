<script lang="ts">
	import type { PageData } from './$types'
	import { useForm } from 'fuma/validation'
	import { rolesMap } from '$lib/member/MemberRole.svelte'
	import { Icon, USE_COERCE_BOOLEAN } from 'fuma'

	export let memberProfile: PageData['memberProfile']
	$: isAdmin = memberProfile.roles.includes('admin')
	const { enhance } = useForm()
</script>

<form action="?/set_isAdmin" method="post" use:enhance class="contents">
	<input type="hidden" name="isAdmin" value="{USE_COERCE_BOOLEAN}{!isAdmin}" />
	<button class="menu-item">
		<Icon path={rolesMap[isAdmin ? 'member' : 'admin'].icon} size={20} />
		<span>{isAdmin ? 'Retirer' : 'Attribuer'} le rôle d'administrateur</span>
	</button>
</form>
