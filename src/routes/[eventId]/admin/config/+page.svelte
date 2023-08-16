<script lang="ts">
	import { Card } from '$lib/material'
	import EventForm from '../../../EventForm.svelte'

	export let data
</script>

<div class="grid grid-cols-2 grid-rows-2 gap-4">
	<Card class="row-span-2">
		<span slot="title">Informations de base</span>
		<EventForm isUpdate successReset={false} event={data.event} class="grow" />
	</Card>

	<Card>
		<span slot="title">Partage</span>

		<div>Evenement visible par : À tous, sur invitation</div>

		<div>Copier le lien de l'évenement</div>

		<div>Inscription</div>

		<div>Le responsable doivent accepter</div>
	</Card>

	<Card>
		<span slot="title">Profile des membres</span>
		<span slot="subtitle">Informations complémentaires demandées aux bénévoles</span>
	</Card>
</div>
