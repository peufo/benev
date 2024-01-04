<script lang="ts">
	import { api } from '$lib/api'
	import { Dialog, InputRelation } from '$lib/material'

	export let title = 'Secteur'
	export let dialog: HTMLDialogElement
</script>

<Dialog bind:dialog>
	<h2 slot="header" class="title">{title}</h2>
	<InputRelation search={$api.team.search} key="teamId" />
	<p>prout</p>
</Dialog>
