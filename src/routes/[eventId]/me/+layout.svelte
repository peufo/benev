<script lang="ts">
	import { mdiArrowLeft } from '@mdi/js'
	import { Icon } from '$lib/material'
	import { LayoutMe } from '$lib/me'
	import { EVENT_STATES } from '$lib/constant'
	export let data
</script>

<LayoutMe user={data.user}>
	<div class="flex gap-2 items-center">
		<a href="/me/events" class="btn btn-square btn-ghost btn-sm">
			<Icon path={mdiArrowLeft} size={20} />
		</a>

		<span class="title">
			{data.event.name}
		</span>

		{#if data.event.state !== 'actived'}
			<Icon
				class="opacity-70 ml-1 {data.event.state === 'draft' ? 'rotate-12' : ''}"
				size={20}
				path={EVENT_STATES[data.event.state].icon}
				title={EVENT_STATES[data.event.state].label}
			/>
		{/if}
	</div>

	<slot />
</LayoutMe>
