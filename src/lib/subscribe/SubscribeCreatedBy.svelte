<script lang="ts">
	import { tip } from 'fuma'
	import { CircleUserIcon, ShieldUserIcon } from '@lucide/svelte'

	interface Props {
		createdBy: 'leader' | 'user'
		size?: number
		class?: string
	}

	let { createdBy, size = 20, class: klass = '' }: Props = $props()

	const label = $derived(
		createdBy === 'leader' ? 'Inscrit par un responsable' : 'Inscrit par le membre'
	)
</script>

<div use:tip={{ content: label }}>
	{#if createdBy === 'leader'}
		<ShieldUserIcon class="opacity-60 {klass}" {size} />
	{:else}
		<CircleUserIcon class="opacity-60 {klass}" {size} />
	{/if}
</div>
