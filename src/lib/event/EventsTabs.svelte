<script lang="ts">
	import { resolve } from '$app/paths'
	import { page } from '$app/state'
</script>

<div class="tabs mb-8">
	<a
		href={resolve('/events')}
		class="tab tab-lg"
		class:tab-active={page.url.pathname === '/events'}
	>
		À venir
	</a>
	<a
		href={resolve('/events/past')}
		class="tab tab-lg"
		class:tab-active={page.url.pathname === '/events/past'}
	>
		Passés
	</a>
</div>
