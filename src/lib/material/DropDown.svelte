<script lang="ts">
	import tippy, { type Props as TippyProps, type Instance as TippyInstance } from 'tippy.js'
	import '$lib/material/dropdown.css'

	import { onMount } from 'svelte'

	export let tippyProps: Partial<TippyProps> = {}
	let klass = ''
	export { klass as class }

	let activator: HTMLDivElement
	let content: HTMLDivElement
	let tip: TippyInstance | undefined = undefined

	onMount(() => {
		const triggerTarget = activator.querySelector('button, input') || activator

		tip = tippy(activator, {
			content,
			placement: 'bottom-start',
			theme: 'dropdown',
			arrow: false,
			triggerTarget,
			trigger: 'click focus',
			interactive: true,
			interactiveDebounce: 50,
			appendTo: 'parent',
			...tippyProps,
		})
		return () => tip?.destroy()
	})

	export function hide() {
		tip?.hide()
	}

	export function show() {
		tip?.show()
	}
</script>

<div>
	<div bind:this={activator}>
		<slot name="activator">
			<button class="btn">dropdown</button>
		</slot>
	</div>

	<div class="hidden">
		<div
			class="{klass} border rounded-lg p-2 bg-base-100 shadow-lg max-h-80 overflow-auto"
			bind:this={content}
		>
			<slot />
		</div>
	</div>
</div>