<script lang="ts">
	import { page } from '$app/stores'
</script>

<div class="tabs mb-8">
	<a href="/events" class="tab tab-lg" class:tab-active={$page.url.pathname === '/events'}>
		À venir
	</a>
	<a
		href="/events/past"
		class="tab tab-lg"
		class:tab-active={$page.url.pathname === '/events/past'}
	>
		Passés
	</a>
</div>
