<script lang="ts">
	import { Dialog } from 'fuma'

	let dialog: HTMLDialogElement = $state()!
	interface Props {
		class?: string
		activator?: import('svelte').Snippet
		header?: import('svelte').Snippet
		children?: import('svelte').Snippet
		action?: import('svelte').Snippet
	}

	let { class: klass = '', activator, header, children, action }: Props = $props()

	const header_render = $derived(header)
</script>

<button type="button" onclick={() => dialog.showModal()} class="btn btn-ghost {klass}">
	{#if activator}{@render activator()}{:else}Confirm button{/if}
</button>

<Dialog bind:dialog>
	{#snippet header()}
		<div class="contents">
			{#if header_render}{@render header_render()}{:else}Confirmation{/if}
		</div>
	{/snippet}
	{@render children?.()}
	<div class="mt-10 flex justify-end gap-2">
		<button type="button" class="btn btn-ghost" onclick={() => dialog.close()}> Annuler </button>
		{@render action?.()}
	</div>
</Dialog>
