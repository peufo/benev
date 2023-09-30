<script lang="ts">
	import Notifications from 'svelte-notifications'
	import '../app.css'
</script>

<svelte:head>
	<title>Benev</title>
	<meta name="description" content="Plateforme de gestion de bénévoles" />
	<meta name="author" content="Jonas Voisard" />
</svelte:head>

<Notifications zIndex={50}>
	<div class="flex min-h-screen flex-col bg-base-200">
		<slot />
	</div>
</Notifications>
