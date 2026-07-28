<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import type { TippyProps } from '$lib/fuma/utils/tippy.js'

	import { Dialog } from '$lib/fuma/ui/dialog/index.js'
	import { DropDown } from '$lib/fuma/ui/menu/index.js'
	import { isSmallScreen } from '$lib/fuma/store/index.js'

	interface Props {
		tippyProps?: Partial<TippyProps>
		class?: string
		header?: import('svelte').Snippet
		children?: import('svelte').Snippet
	}

	let { tippyProps = {}, class: klass = '', header, children }: Props = $props()

	const dispatch = createEventDispatcher<{ show: void; hide: void }>()

	let dropdown: DropDown = $state()
	let dialog: HTMLDialogElement = $state()

	export function show(event: MouseEvent) {
		if ($isSmallScreen) {
			dialog?.showModal()
		} else {
			const target = event.target as HTMLElement
			if (!target || !(target instanceof HTMLElement)) return
			dropdown?.setTippyProps({
				getReferenceClientRect: () => new DOMRect(event.clientX, event.clientY),
			})
			dropdown?.show()
		}

		dispatch('show')
	}

	export function hide() {
		if ($isSmallScreen) dialog?.close()
		else dropdown?.hide()
		dispatch('hide')
	}

	const header_render = $derived(header)
</script>

{#if $isSmallScreen}
	<Dialog bind:dialog class={klass}>
		{#snippet header()}
			<div class="contents">
				{@render header_render?.()}
			</div>
		{/snippet}
		{@render children?.()}
	</Dialog>
{:else}
	<DropDown class={klass} bind:this={dropdown} tippyProps={{ offset: [0, -5], ...tippyProps }}>
		<div class="flex flex-col gap-2 p-1">
			{@render header?.()}
			{@render children?.()}
		</div>
	</DropDown>
{/if}
