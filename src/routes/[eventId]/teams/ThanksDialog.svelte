<script lang="ts">
	import { Dialog } from 'fuma'
	import JSConfetti from 'js-confetti'

	let dialog: HTMLDialogElement = $state()!

	export function open() {
		dialog.showModal()
		const jsConfetti = new JSConfetti()
		jsConfetti.addConfetti({
			confettiRadius: 10,
			confettiNumber: 200,
		})
	}
</script>

<Dialog bind:dialog hideCloseButton>
	{#snippet header()}
		<h2 class="text-center text-2xl">Un énorme merci !</h2>
	{/snippet}

	<p>Tu recevras une confirmation par mail dès que ton inscription sera validée.</p>

	<div class="flex gap-2 justify-end">
		<button class="btn" onclick={() => dialog.close()}>OK, ça joue !</button>
	</div>
</Dialog>
