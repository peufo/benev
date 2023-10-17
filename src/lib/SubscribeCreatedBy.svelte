<script lang="ts">
	import { Icon } from '$lib/material'
	import { mdiAccountCircleOutline, mdiShieldAccount } from '@mdi/js'

	export let createdBy: 'leader' | 'user'
	export let size = 24
	let klass = ''
	export { klass as class }
</script>

{#if createdBy === 'leader'}
	<Icon
		path={mdiShieldAccount}
		title="Inscrit par un responsable"
		class="opacity-60 {klass}"
		{size}
		disableTitlePropagation
		tippyProps={{ appendTo: 'parent' }}
	/>
{:else}
	<Icon
		path={mdiAccountCircleOutline}
		title="Inscrit par le membre"
		class="opacity-60 {klass}"
		{size}
		disableTitlePropagation
		tippyProps={{ appendTo: 'parent' }}
	/>
{/if}
