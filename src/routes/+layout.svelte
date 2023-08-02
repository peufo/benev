<script lang="ts">
	import Notifications from 'svelte-notifications'
	import '../app.css'

</script>

<Notifications zIndex={50}>
	<div class="flex min-h-screen flex-col bg-base-200">
		<slot />
	</div>
</Notifications>
