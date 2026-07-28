<script lang="ts">
	import { Icon } from '$lib/fuma'
	import { mdiAccountCircleOutline, mdiShieldAccountOutline } from '@mdi/js'

	interface Props {
		createdBy: 'leader' | 'user'
		size?: number
		class?: string
	}

	let { createdBy, size = 24, class: klass = '' }: Props = $props()
</script>

<div class="w-min">
	{#if createdBy === 'leader'}
		<Icon
			path={mdiShieldAccountOutline}
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
</div>
