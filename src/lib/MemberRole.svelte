<script lang="ts" context="module">
	export const rolesMap: Record<MemberRole, { icon: string; label: string }> = {
		owner: { label: 'Propriétaire', icon: mdiCrownOutline },
		admin: { label: 'Administrateur', icon: mdiStarOutline },
		leader: { label: 'Responsable', icon: mdiShieldAccountOutline },
		member: { label: 'Membre', icon: mdiAccountCircleOutline },
	}
</script>

<script lang="ts">
	import type { MemberRole } from '$lib/server'
	import { Icon } from '$lib/material'
	import {
		mdiShieldAccountOutline,
		mdiAccountCircleOutline,
		mdiCrownOutline,
		mdiStarOutline,
	} from '@mdi/js'

	export let roles: MemberRole[]
	let klass = ''
	export { klass as class }
	export let mode: 'badge' | 'icon' | 'contents' = 'badge'

	const rolesOrder: MemberRole[] = ['owner', 'admin', 'leader', 'member']
	$: role = rolesOrder.find((r) => roles.includes(r))
</script>

{#if role}
	{#if mode === 'badge'}
		<div class="badge badge-ghost badge-lg font-normal opacity-80 {klass}">
			<Icon path={rolesMap[role].icon} class="-translate-x-1" size={22} />
			<span>{rolesMap[role].label}</span>
		</div>
	{:else if mode === 'contents'}
		<Icon path={rolesMap[role].icon} class="-translate-x-1" size={22} />
		<span>{rolesMap[role].label}</span>
	{:else if role !== 'member'}
		<Icon
			path={rolesMap[role].icon}
			class="opacity-70"
			size={20}
			title={rolesMap[role].label}
			disableTitlePropagation
		/>
	{/if}
{/if}
