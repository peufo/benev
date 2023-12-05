<script lang="ts" context="module">
	export const rolesMap: Record<MemberRole, { icon: string; label: string }> = {
		root: { label: '__ROOT_USER__', icon: mdiShieldCrownOutline },
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
		mdiShieldCrownOutline,
	} from '@mdi/js'

	export let roles: MemberRole[]
	let klass = ''
	export { klass as class }
	export let mode: 'badge' | 'icon' | 'contents' = 'badge'
	export let iconSize = 21

	const rolesOrder: MemberRole[] = ['root', 'owner', 'admin', 'leader', 'member']
	$: role = rolesOrder.find((r) => roles.includes(r))
</script>

{#if role}
	{#if mode === 'badge'}
		<div class="badge badge-ghost font-normal opacity-80 {klass}">
			<Icon path={rolesMap[role].icon} class="-translate-x-1" size={iconSize} />
			<span>{rolesMap[role].label}</span>
		</div>
	{:else if mode === 'contents'}
		<Icon path={rolesMap[role].icon} class="-translate-x-1" size={iconSize} />
		<span>{rolesMap[role].label}</span>
	{:else if role !== 'member'}
		<Icon
			path={rolesMap[role].icon}
			class="opacity-70"
			size={iconSize}
			title={rolesMap[role].label}
			disableTitlePropagation
		/>
	{/if}
{/if}
