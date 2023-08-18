<script>
	import { Card } from '$lib/material'
	import MemberForm from '$lib/MemberForm.svelte'
	import { eventPath } from '$lib/store'
	export let data
</script>

{#if !data.user}
	<span>Connexion requise (redirection...)</span>
{:else if data.member}
	<Card class="max-w-2xl mx-auto">
		<span slot="title">Super! Tu es membre de "{data.event.name}"</span>
		<br />
		<a href={$eventPath} class="btn"> Aller à la page d'accueil</a>
	</Card>
{:else}
	<MemberForm event={data.event} userId={data.user.id} class="mx-auto" />
{/if}
