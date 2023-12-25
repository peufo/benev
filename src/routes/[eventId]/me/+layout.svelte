<script lang="ts">
	import { mdiArrowLeft } from '@mdi/js'
	import { Icon } from '$lib/material'
	import { LayoutMe } from '$lib/me'
	import { eventStates } from '$lib/validation'
	export let data
</script>

<LayoutMe>
	<div class="flex gap-2 items-center">
		<a href="/me/events" class="btn btn-square btn-ghost btn-sm">
			<Icon path={mdiArrowLeft} size={20} />
		</a>

		<span class="title">
			{data.event.name}
		</span>

		{#if data.event.state !== 'active'}
			<Icon
				class="opacity-70 ml-1 {data.event.state === 'draft' ? 'rotate-12' : ''}"
				size={20}
				path={eventStates[data.event.state].icon}
				title={eventStates[data.event.state].label}
			/>
		{/if}
	</div>

	<slot />
</LayoutMe>
