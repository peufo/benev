<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte'
	import { mdiClose } from '@mdi/js'
	import { Icon } from '$lib/fuma/ui/icon/index.js'
	import { contextContainer } from '$lib/fuma/ui/context.js'

	interface Props {
		dialog: HTMLDialogElement
		hideCloseButton?: boolean
		class?: string
		header?: import('svelte').Snippet
		children?: import('svelte').Snippet
		footer?: import('svelte').Snippet
	}

	let {
		dialog = $bindable(),
		hideCloseButton = false,
		class: klass = '',
		header,
		children,
		footer,
	}: Props = $props()

	const dispatch = createEventDispatcher<{ open: void; close: void }>()
	contextContainer.set('dialog')

	onMount(() => {
		const inputsSelector = 'input:not([type=hidden], [tabindex="-1"])'
		const inputs = dialog.querySelectorAll<HTMLInputElement>(inputsSelector)
		const buttons = dialog.querySelectorAll<HTMLButtonElement>('button')

		inputs.forEach((input) => (input.tabIndex = -1))
		buttons.forEach((button) => (button.tabIndex = -1))

		function onDialogOpen() {
			dispatch('open')
			inputs.forEach((input) => (input.tabIndex = 0))
			buttons.forEach((button) => (button.tabIndex = 0))
			if (!inputs[0]) return
			inputs[0].focus()
			inputs[0].select()
		}

		function onDialogClose() {
			dispatch('close')
			inputs.forEach((input) => (input.tabIndex = -1))
			buttons.forEach((button) => (button.tabIndex = -1))
		}

		const observer = new MutationObserver(() => (dialog.open ? onDialogOpen() : onDialogClose()))
		observer.observe(dialog, { attributeFilter: ['open'] })
		return () => observer.disconnect()
	})
</script>

<dialog bind:this={dialog} class="modal" tabindex="-1">
	<div class="modal-box bordered flex flex-col rounded-lg border p-0">
		<div class="relative flex items-center border-b p-4">
			<div class="grow">
				{@render header?.()}
			</div>

			{#if !hideCloseButton}
				<button
					type="button"
					class="ml btn btn-square btn-ghost btn-sm"
					onclick={() => dialog.close()}
				>
					<Icon path={mdiClose} />
				</button>
			{/if}
		</div>
		<div class="grow overflow-auto p-4 {klass}">
			{@render children?.()}
		</div>

		{@render footer?.()}
	</div>
</dialog>
