<script lang="ts">
	import { Dialog } from '$lib/material'

	let dialog: HTMLDialogElement
  let klass = ''
  export {klass as class}

</script>

<button type="button" on:click={() => dialog.showModal()} class="btn btn-ghost {klass}">
	<slot name="activator">Confirm button</slot>
</button>

<Dialog bind:dialog>
	<div slot="header" class="contents">
		<slot name="header">Confirmation</slot>
	</div>
  <slot/>
  <div class="flex justify-end gap-2 mt-10">
    <button type="button" class="btn btn-ghost btn-sm" on:click={() => dialog.close()}>Annuler</button>
    <slot name="action" />
  </div>
</Dialog>
