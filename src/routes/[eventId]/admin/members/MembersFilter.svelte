<script lang="ts">
	import { slide } from 'svelte/transition'
	import type { Field } from '@prisma/client'
	import {
		mdiAccountCircleOutline,
		mdiAlertOutline,
		mdiCheckCircleOutline,
		mdiShieldAccountOutline,
		mdiStarOutline,
	} from '@mdi/js'

	import { urlParam } from '$lib/store'
	import { InputOptionInParam } from '$lib/material'
</script>

<InputOptionInParam
  class="bg-base-200"
	key="role"
	removeKeys={['isAbsent']}
	options={{
		admin: {
			icon: mdiStarOutline,
			label: 'Administrateurs',
		},
		leader: {
			icon: mdiShieldAccountOutline,
			label: 'Responsables (au moins un secteur à charge)',
		},
		member: {
			icon: mdiAccountCircleOutline,
			label: 'Bénévoles (au moins une inscription)',
		},
	}}
/>

{#if $urlParam.hasValue('role', 'member')}
	<div transition:slide={{ axis: 'x' }}>
		<InputOptionInParam
			key="isAbsent"
			options={{
				false: { label: 'Présent à toutes ses périodes', icon: mdiCheckCircleOutline },
				true: { label: 'Absent à une période ou plus', icon: mdiAlertOutline },
			}}
		/>
	</div>
{/if}
