<script lang="ts">

	import { Icon } from "$lib/material"
	import { mdiPlus } from "@mdi/js"
	import TeamForm from "./TeamForm.svelte"

  let createDialog: HTMLDialogElement

  export let data

</script>

<dialog bind:this={createDialog} class="modal">
	<TeamForm class="modal-box" />
</dialog>

<div class="p-4 card bg-base-100">
	<div class="flex gap-2 py-2 items-center">
		<h2 class="text-2xl">Toutes les équipes</h2>
		<div class="grow" />
    {#if data.event.ownerId === data.user?.userId}
      <button class="btn btn-primary" on:click={() => createDialog.showModal()}>
        <Icon path={mdiPlus} />
        Ajouter
      </button>
    {/if}
	</div>
	<hr />

	<TeamForm  />
</div>