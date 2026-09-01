<script lang="ts" module>
	import {
		CircleUserIcon,
		CrownIcon,
		type IconProps,
		ShieldIcon,
		ShieldUserIcon,
		StarIcon,
	} from '@lucide/svelte'
	import type { Component } from 'svelte'
	import type { MemberRole } from '$lib/server'

	export const rolesMap: Record<MemberRole, { icon: Component<IconProps>; label: string }> = {
		root: { label: '__ROOT_USER__', icon: ShieldIcon },
		owner: { label: 'Propriétaire', icon: CrownIcon },
		admin: { label: 'Administrateur·ice', icon: StarIcon },
		leader: { label: 'Responsable', icon: ShieldUserIcon },
		member: { label: 'Membre', icon: CircleUserIcon },
	}
</script>

<script lang="ts">
	import { tip } from 'fuma'

	interface Props {
		roles: MemberRole[]
		class?: string
		mode?: 'badge' | 'icon' | 'contents'
		iconSize?: number
	}

	let { roles, class: klass = '', mode = 'badge', iconSize = 21 }: Props = $props()

	const rolesOrder: MemberRole[] = ['root', 'owner', 'admin', 'leader', 'member']
	let role = $derived(rolesOrder.find((r) => roles.includes(r)))
	let RoleIcon = $derived(role ? rolesMap[role].icon : undefined)
</script>

{#if role && role !== 'root' && RoleIcon}
	{#if mode === 'badge'}
		<div class="badge badge-ghost font-normal opacity-80 {klass}">
			<RoleIcon class="-translate-x-1" size={iconSize} />
			<span>{rolesMap[role].label}</span>
		</div>
	{:else if mode === 'contents'}
		<RoleIcon class="-translate-x-1" size={iconSize} />
		<span>{rolesMap[role].label}</span>
	{:else if role !== 'member'}
		<span class="inline-flex" use:tip={{ content: rolesMap[role].label }}>
			<RoleIcon class="opacity-70" size={iconSize} />
		</span>
	{/if}
{/if}
