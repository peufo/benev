<script lang="ts">
	import {
		CircleCheckIcon,
		CircleUserIcon,
		ShieldUserIcon,
		StarIcon,
		TriangleAlertIcon,
	} from '@lucide/svelte'
	import { slide } from 'svelte/transition'
	import { InputOptionInParam } from '$lib/ui'
	import { urlParam } from 'fuma'
</script>

<InputOptionInParam
	class="bg-base-200"
	key="role"
	removeKeys={['isAbsent']}
	options={{
		admin: {
			icon: StarIcon,
			label: 'Administrateurs',
		},
		leader: {
			icon: ShieldUserIcon,
			label: 'Responsables (au moins un secteur à charge)',
		},
		member: {
			icon: CircleUserIcon,
			label: 'Bénévoles (au moins une inscription)',
		},
	}}
/>

{#if urlParam.has('role', 'member')}
	<div transition:slide={{ axis: 'x' }}>
		<InputOptionInParam
			key="isAbsent"
			options={{
				false: { label: 'Présent à toutes ses périodes', icon: CircleCheckIcon },
				true: { label: 'Absent à une période ou plus', icon: TriangleAlertIcon },
			}}
		/>
	</div>
{/if}
